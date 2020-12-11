import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import AudioLoadObserver from './audioloadobserver';

import {
	viewFigureToModel,
	modelToViewAttributeConverter
} from './converters';

import { toAudioWidget } from './utils';

import AudioInsertCommand from './audioinsertcommand';

export default class AudioEditing extends Plugin {
	static get pluginName() {
		return 'AudioEditing';
	}

	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const t = editor.t;
		const conversion = editor.conversion;

		editor.editing.view.addObserver(AudioLoadObserver);

		// Configure schema.
		schema.register('audio', {
			isObject: true,
			isBlock: true,
			allowWhere: '$block',
			allowAttributes: ['src', 'controls']
		});

		conversion.for('dataDowncast').elementToElement({
			model: 'audio',
			view: (modelElement, { writer }) => createAudioViewElement(writer)
		});

		conversion.for('editingDowncast').elementToElement({
			model: 'audio',
			view: (modelElement, { writer }) => toAudioWidget(createAudioViewElement(writer), writer, t('audio widget'))
		});

		conversion.for('downcast').add(modelToViewAttributeConverter('src'));
		conversion.for('downcast').add(modelToViewAttributeConverter('controls'));

		conversion.for('upcast')
			.elementToElement({
				view: {
					name: 'audio',
					attributes: {
						src: true
					}
				},
				model: (viewAudio, { writer }) => writer.createElement('audio', { src: viewAudio.getAttribute('src'), controls: 'controls', })
			})
			.add(viewFigureToModel());

		editor.commands.add('audioInsert', new AudioInsertCommand(editor));
	}
}

export function createAudioViewElement(writer) {
	const emptyElement = writer.createEmptyElement('audio');
	const figure = writer.createContainerElement('figure', { class: 'audio' });

	writer.insert(writer.createPositionAt(figure, 0), emptyElement);

	return figure;
}
