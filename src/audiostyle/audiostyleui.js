import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { normalizeAudioStyles } from './utils';
import '../../theme/audiostyle.css';

export default class AudioStyleUI extends Plugin {
    static get pluginName() {
        return 'AudioStyleUI';
    }

    get localizedDefaultStylesTitles() {
        const t = this.editor.t;

        return {
            'Full size audio': t( 'Full size audio' ),
            'Side audio': t( 'Side audio' ),
            'Left aligned audio': t( 'Left aligned audio' ),
            'Centered audio': t( 'Centered audio' ),
            'Right aligned audio': t( 'Right aligned audio' )
        };
    }

    init() {
        const editor = this.editor;
        const configuredStyles = editor.config.get( 'audio.styles' );

        const translatedStyles = translateStyles( normalizeAudioStyles( configuredStyles ), this.localizedDefaultStylesTitles );

        for ( const style of translatedStyles ) {
            this._createButton( style );
        }
    }

    _createButton( style ) {
        const editor = this.editor;

        const componentName = `audioStyle:${ style.name }`;

        editor.ui.componentFactory.add( componentName, locale => {
            const command = editor.commands.get( 'audioStyle' );
            const view = new ButtonView( locale );

            view.set( {
                label: style.title,
                icon: style.icon,
                tooltip: true,
                isToggleable: true
            } );

            view.bind( 'isEnabled' ).to( command, 'isEnabled' );
            view.bind( 'isOn' ).to( command, 'value', value => value === style.name );

            this.listenTo( view, 'execute', () => {
                editor.execute( 'audioStyle', { value: style.name } );
                editor.editing.view.focus();
            } );

            return view;
        } );
    }
}

function translateStyles( styles, titles ) {
    for ( const style of styles ) {
        // Localize the titles of the styles, if a title corresponds with
        // a localized default provided by the plugin.
        if ( titles[ style.title ] ) {
            style.title = titles[ style.title ];
        }
    }

    return styles;
}
