import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Audiostylecommand from './audiostylecommand';
import { viewToModelStyleAttribute, modelToViewStyleAttribute } from './converters';
import { normalizeAudioStyles } from './utils';

export default class Audiostyleediting extends Plugin {
    static get pluginName() {
        return 'AudioStyleEditing';
    }
    init() {
        const editor = this.editor;
        const schema = editor.model.schema;
        const data = editor.data;
        const editing = editor.editing;

        // Define default configuration.
        editor.config.define( 'audio.styles', [ 'full', 'side' ] );

        // Get configuration.
        const styles = normalizeAudioStyles( editor.config.get( 'audio.styles' ) );

        // Allow audioStyle attribute in audio.
        schema.extend( 'audio', { allowAttributes: 'audioStyle' } );

        // Converters for audioStyle attribute from model to view.
        const modelToViewConverter = modelToViewStyleAttribute( styles );
        editing.downcastDispatcher.on( 'attribute:audioStyle:audio', modelToViewConverter );
        data.downcastDispatcher.on( 'attribute:audioStyle:audio', modelToViewConverter );

        // Converter for figure element from view to model.
        data.upcastDispatcher.on( 'element:figure', viewToModelStyleAttribute( styles ), { priority: 'low' } );

        // Register audioStyle command.
        editor.commands.add( 'audioStyle', new Audiostylecommand( editor, styles ) );
    }
}
