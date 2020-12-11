
import Command from '@ckeditor/ckeditor5-core/src/command';
import { isAudio } from '../audio/utils';

export default class AudioResizeCommand extends Command {
	refresh() {
		const element = this.editor.model.document.selection.getSelectedElement();

		this.isEnabled = isAudio( element );

		if ( !element || !element.hasAttribute( 'width' ) ) {
			this.value = null;
		} else {
			this.value = {
				width: element.getAttribute( 'width' ),
				height: null
			};
		}
	}

	execute( options ) {
		const model = this.editor.model;
		const audioElement = model.document.selection.getSelectedElement();

		this.value = {
			width: options.width,
			height: null
		};

		if ( audioElement ) {
			model.change( writer => {
				writer.setAttribute( 'width', options.width, audioElement );
			} );
		}
	}
}
