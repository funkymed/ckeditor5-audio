import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import uploadingPlaceholder from '../../theme/icons/audio_placeholder.svg';
import { getViewAudioFromWidget } from '../audio/utils';

import '../../theme/audiouploadprogress.css';
import '../../theme/audiouploadicon.css';
import '../../theme/audiouploadloader.css';

export default class AudioUploadProgress extends Plugin {
    constructor(editor) {
        super(editor);

        this.placeholder = 'data:audio/svg+xml;utf8,' + encodeURIComponent(uploadingPlaceholder);
    }

    init() {
        const editor = this.editor;

        // Upload status change - update audio's view according to that status.
        editor.editing.downcastDispatcher.on('attribute:uploadStatus:audio', (...args) => this.uploadStatusChange(...args));
    }

    uploadStatusChange(evt, data, conversionApi) {
        const editor = this.editor;
        const modelAudio = data.item;
        const uploadId = modelAudio.getAttribute('uploadId');

        if (!conversionApi.consumable.consume(data.item, evt.name)) {
            return;
        }

        const fileRepository = editor.plugins.get(FileRepository);
        const status = uploadId ? data.attributeNewValue : null;
        const placeholder = this.placeholder;
        const viewFigure = editor.editing.mapper.toViewElement(modelAudio);
        const viewWriter = conversionApi.writer;

        if (status === 'reading') {
            // Start "appearing" effect and show placeholder with infinite progress bar on the top
            // while audio is read from disk.
            _startAppearEffect(viewFigure, viewWriter);
            _showPlaceholder(placeholder, viewFigure, viewWriter);

            return;
        }

        // Show progress bar on the top of the audio when audio is uploading.
        if (status === 'uploading') {
            const loader = fileRepository.loaders.get(uploadId);

            // Start appear effect if needed - see https://github.com/ckeditor/ckeditor5-image/issues/191.
            _startAppearEffect(viewFigure, viewWriter);

            if (!loader) {
                // There is no loader associated with uploadId - this means that audio came from external changes.
                // In such cases we still want to show the placeholder until audio is fully uploaded.
                // Show placeholder if needed - see https://github.com/ckeditor/ckeditor5-image/issues/191.
                _showPlaceholder(placeholder, viewFigure, viewWriter);
            } else {
                // Hide placeholder and initialize progress bar showing upload progress.
                _hidePlaceholder(viewFigure, viewWriter);
                _showProgressBar(viewFigure, viewWriter, loader, editor.editing.view);
                _displayLocalAudio(viewFigure, viewWriter, loader);
            }

            return;
        }

        if (status === 'complete' && fileRepository.loaders.get(uploadId)) {
            _showCompleteIcon(viewFigure, viewWriter, editor.editing.view);
        }

        // Clean up.
        _hideProgressBar(viewFigure, viewWriter);
        _hidePlaceholder(viewFigure, viewWriter);
        _stopAppearEffect(viewFigure, viewWriter);
    }
}

function _startAppearEffect(viewFigure, writer) {
    if (!viewFigure.hasClass('ck-appear')) {
        writer.addClass('ck-appear', viewFigure);
    }
}

function _stopAppearEffect(viewFigure, writer) {
    writer.removeClass('ck-appear', viewFigure);
}

function _showPlaceholder(placeholder, viewFigure, writer) {
    if (!viewFigure.hasClass('ck-audio-upload-placeholder')) {
        writer.addClass('ck-audio-upload-placeholder', viewFigure);
    }

    const viewAudio = getViewAudioFromWidget(viewFigure);

    if (viewAudio.getAttribute('src') !== placeholder) {
        writer.setAttribute('src', placeholder, viewAudio);
    }

    writer.setAttribute('controls', 'controls', viewAudio);

    if (!_getUIElement(viewFigure, 'placeholder')) {
        writer.insert(writer.createPositionAfter(viewAudio), _createPlaceholder(writer));
    }
}

function _hidePlaceholder(viewFigure, writer) {
    if (viewFigure.hasClass('ck-audio-upload-placeholder')) {
        writer.removeClass('ck-audio-upload-placeholder', viewFigure);
    }

    _removeUIElement(viewFigure, writer, 'placeholder');
}

function _showProgressBar(viewFigure, writer, loader, view) {
    const progressBar = _createProgressBar(writer);
    writer.insert(writer.createPositionAt(viewFigure, 'end'), progressBar);

    // Update progress bar width when uploadedPercent is changed.
    loader.on('change:uploadedPercent', (evt, name, value) => {
        view.change(writer => {
            writer.setStyle('width', value + '%', progressBar);
        });
    });
}

function _hideProgressBar(viewFigure, writer) {
    _removeUIElement(viewFigure, writer, 'progressBar');
}

function _showCompleteIcon(viewFigure, writer, view) {
    const completeIcon = writer.createUIElement('div', { class: 'ck-audio-upload-complete-icon' });

    writer.insert(writer.createPositionAt(viewFigure, 'end'), completeIcon);

    setTimeout(() => {
        view.change(writer => writer.remove(writer.createRangeOn(completeIcon)));
    }, 3000);
}

function _createProgressBar(writer) {
    const progressBar = writer.createUIElement('div', { class: 'ck-progress-bar' });

    writer.setCustomProperty('progressBar', true, progressBar);

    return progressBar;
}

function _createPlaceholder(writer) {
    const placeholder = writer.createUIElement('div', { class: 'ck-upload-placeholder-loader' });

    writer.setCustomProperty('placeholder', true, placeholder);

    return placeholder;
}

function _getUIElement(audioFigure, uniqueProperty) {
    for (const child of audioFigure.getChildren()) {
        if (child.getCustomProperty(uniqueProperty)) {
            return child;
        }
    }
}

function _removeUIElement(viewFigure, writer, uniqueProperty) {
    const element = _getUIElement(viewFigure, uniqueProperty);

    if (element) {
        writer.remove(writer.createRangeOn(element));
    }
}

function _displayLocalAudio(viewFigure, writer, loader) {
    if (loader.data) {
        const viewAudio = getViewAudioFromWidget(viewFigure);

        writer.setAttribute('src', loader.data, viewAudio);
        writer.setAttribute('controls', 'controls', viewAudio);
    }
}
