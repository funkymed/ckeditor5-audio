import Command from '@ckeditor/ckeditor5-core/src/command';
import { insertAudio, isAudioAllowed } from './utils';

export default class AudioInsertCommand extends Command {
	refresh() {
		this.isEnabled = isAudioAllowed(this.editor.model);
	}

	execute(options) {
		const model = this.editor.model;

		model.change(writer => {
			const sources = Array.isArray(options.source) ? options.source : [options.source];

			for (const src of sources) {
				insertAudio(writer, model, { src, controls: 'controls', });
			}
		});
	}
}
