import Command from '@ckeditor/ckeditor5-core/src/command';
import { isAudio } from '../audio/utils';

export default class Audiostylecommand extends Command {
    constructor( editor, styles ) {
        super( editor );

        this.defaultStyle = false;

        this.styles = styles.reduce( ( styles, style ) => {
            styles[ style.name ] = style;

            if ( style.isDefault ) {
                this.defaultStyle = style.name;
            }

            return styles;
        }, {} );
    }

    refresh() {
        const element = this.editor.model.document.selection.getSelectedElement();

        this.isEnabled = isAudio( element );

        if ( !element ) {
            this.value = false;
        } else if ( element.hasAttribute( 'audioStyle' ) ) {
            const attributeValue = element.getAttribute( 'audioStyle' );
            this.value = this.styles[ attributeValue ] ? attributeValue : false;
        } else {
            this.value = this.defaultStyle;
        }
    }

    execute( options ) {
        const styleName = options.value;

        const model = this.editor.model;
        const audioElement = model.document.selection.getSelectedElement();

        model.change( writer => {
            // Default style means that there is no `audioStyle` attribute in the model.
            if ( this.styles[ styleName ].isDefault ) {
                writer.removeAttribute( 'audioStyle', audioElement );
            } else {
                writer.setAttribute( 'audioStyle', styleName, audioElement );
            }
        } );
    }
}
