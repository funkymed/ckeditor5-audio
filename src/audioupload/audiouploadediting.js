import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Notification from '@ckeditor/ckeditor5-ui/src/notification/notification';
import UploadAudioCommand from "./uploadaudiocommand";
import FileRepository from "@ckeditor/ckeditor5-upload/src/filerepository";
import {
    createAudioMediaTypeRegExp,
    fetchLocalAudio,
    getAudiosFromChangeItem,
    isHtmlIncluded,
    isLocalAudio
} from "./utils";
import Clipboard from "@ckeditor/ckeditor5-clipboard/src/clipboard";
import UpcastWriter from "@ckeditor/ckeditor5-engine/src/view/upcastwriter";
import env from "@ckeditor/ckeditor5-utils/src/env";
import { getViewAudioFromWidget } from "../audio/utils";

const DEFAULT_AUDIO_EXTENSIONS = ['mp3', 'ogg'];

export default class AudioUploadEditing extends Plugin {
    static get requires() {
        return [FileRepository, Notification, Clipboard];
    }

    constructor(editor) {
        super(editor);

        editor.config.define('audio.upload', {
            types: DEFAULT_AUDIO_EXTENSIONS,
            allowMultipleFiles: true,
        });
    }

    init() {
        const editor = this.editor;
        const doc = editor.model.document;
        const schema = editor.model.schema;
        const conversion = editor.conversion;
        const fileRepository = editor.plugins.get(FileRepository);
        const audioTypes = createAudioMediaTypeRegExp(editor.config.get('audio.upload.types'));

        // Setup schema to allow uploadId and uploadStatus for audios.
        schema.extend('audio', {
            allowAttributes: ['uploadId', 'uploadStatus']
        });

        editor.commands.add('uploadAudio', new UploadAudioCommand(editor))

        // Register upcast converter for uploadId.
        conversion.for('upcast')
            .attributeToAttribute({
                view: {
                    name: 'audio',
                    key: 'uploadId'
                },
                model: 'uploadId'
            });

        this.listenTo(editor.editing.view.document, 'clipboardInput', (evt, data) => {
            // Skip if non empty HTML data is included.
            // https://github.com/ckeditor/ckeditor5-upload/issues/68
            if (isHtmlIncluded(data.dataTransfer)) {
                return;
            }

            const audios = Array.from(data.dataTransfer.files).filter(file => {
                // See https://github.com/ckeditor/ckeditor5-image/pull/254.
                if (!file) {
                    return false;
                }

                return audioTypes.test(file.type);
            });

            const ranges = data.targetRanges.map(viewRange => editor.editing.mapper.toModelRange(viewRange));

            editor.model.change(writer => {
                // Set selection to paste target.
                writer.setSelection(ranges);

                if (audios.length) {
                    evt.stop();

                    // Upload audios after the selection has changed in order to ensure the command's state is refreshed.
                    editor.model.enqueueChange('default', () => {
                        editor.execute('audioUpload', { file: audios });
                    });
                }
            });
        });


        this.listenTo(editor.plugins.get(Clipboard), 'inputTransformation', (evt, data) => {
            const fetchableAudios = Array.from(editor.editing.view.createRangeIn(data.content))
                .filter(value => isLocalAudio(value.item) && !value.item.getAttribute('uploadProcessed'))
                .map(value => {
                    return { promise: fetchLocalAudio(value.item), audioElement: value.item };
                });

            if (!fetchableAudios.length) {
                return;
            }

            const writer = new UpcastWriter(editor.editing.view.document);

            for (const fetchableAudio of fetchableAudios) {
                // Set attribute marking that the audio was processed already.
                writer.setAttribute('uploadProcessed', true, fetchableAudio.audioElement);

                const loader = fileRepository.createLoader(fetchableAudio.promise);

                if (loader) {
                    writer.setAttribute('src', '', fetchableAudio.audioElement);
                    writer.setAttribute('controls', 'controls', fetchableAudio.audioElement);
                    writer.setAttribute('uploadId', loader.id, fetchableAudio.audioElement);
                }
            }
        });

        // Prevents from the browser redirecting to the dropped audio.
        editor.editing.view.document.on('dragover', (evt, data) => {
            data.preventDefault();
        });


        // Upload placeholder audios that appeared in the model.
        doc.on('change', () => {
            const changes = doc.differ.getChanges({ includeChangesInGraveyard: true });

            for (const entry of changes) {
                if (entry.type === 'insert' && entry.name !== '$text') {
                    const item = entry.position.nodeAfter;
                    const isInGraveyard = entry.position.root.rootName === '$graveyard';

                    for (const audio of getAudiosFromChangeItem(editor, item)) {
                        // Check if the audio element still has upload id.
                        const uploadId = audio.getAttribute('uploadId');

                        if (!uploadId) {
                            continue;
                        }

                        // Check if the audio is loaded on this client.
                        const loader = fileRepository.loaders.get(uploadId);

                        if (!loader) {
                            continue;
                        }

                        if (isInGraveyard) {
                            // If the audio was inserted to the graveyard - abort the loading process.
                            loader.abort();
                        } else if (loader.status === 'idle') {
                            // If the audio was inserted into content and has not been loaded yet, start loading it.
                            this._readAndUpload(loader, audio);
                        }
                    }
                }
            }
        });
    }

    _readAndUpload(loader, audioElement) {
        const editor = this.editor;
        const model = editor.model;
        const t = editor.locale.t;
        const fileRepository = editor.plugins.get(FileRepository);
        const notification = editor.plugins.get(Notification);

        model.enqueueChange('transparent', writer => {
            writer.setAttribute('uploadStatus', 'reading', audioElement);
        });

        return loader.read()
            .then(() => {
                const promise = loader.upload();

                // Force re–paint in Safari. Without it, the audio will display with a wrong size.
                // https://github.com/ckeditor/ckeditor5/issues/1975
                /* istanbul ignore next */
                if (env.isSafari) {
                    const viewFigure = editor.editing.mapper.toViewElement(audioElement);
                    const viewAudio = getViewAudioFromWidget(viewFigure);

                    editor.editing.view.once('render', () => {
                        // Early returns just to be safe. There might be some code ran
                        // in between the outer scope and this callback.
                        if (!viewAudio.parent) {
                            return;
                        }

                        const domFigure = editor.editing.view.domConverter.mapViewToDom(viewAudio.parent);

                        if (!domFigure) {
                            return;
                        }

                        const originalDisplay = domFigure.style.display;

                        domFigure.style.display = 'none';

                        // Make sure this line will never be removed during minification for having "no effect".
                        domFigure._ckHack = domFigure.offsetHeight;

                        domFigure.style.display = originalDisplay;
                    });
                }

                model.enqueueChange('transparent', writer => {
                    writer.setAttribute('uploadStatus', 'uploading', audioElement);
                });

                return promise;
            })
            .then(data => {
                model.enqueueChange('transparent', writer => {
                    writer.setAttributes({ uploadStatus: 'complete', src: data.default }, audioElement);
                });

                clean();
            })
            .catch(error => {
                // If status is not 'error' nor 'aborted' - throw error because it means that something else went wrong,
                // it might be generic error and it would be real pain to find what is going on.
                if (loader.status !== 'error' && loader.status !== 'aborted') {
                    throw error;
                }

                // Might be 'aborted'.
                if (loader.status === 'error' && error) {
                    notification.showWarning(error, {
                        title: t('Upload failed'),
                        namespace: 'upload'
                    });
                }

                clean();

                // Permanently remove audio from insertion batch.
                model.enqueueChange('transparent', writer => {
                    writer.remove(audioElement);
                });
            });

        function clean() {
            model.enqueueChange('transparent', writer => {
                writer.removeAttribute('uploadId', audioElement);
                writer.removeAttribute('uploadStatus', audioElement);
            });

            fileRepository.destroyLoader(loader);
        }
    }
}
