import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { getSelectedAudioWidget } from './audio/utils';
import WidgetToolbarRepository from '@ckeditor/ckeditor5-widget/src/widgettoolbarrepository';

export default class AudioToolbar extends Plugin {
    static get requires() {
        return [ WidgetToolbarRepository ];
    }

    static get pluginName() {
        return 'AudioToolbar';
    }

    afterInit() {
        const editor = this.editor;
        const t = editor.t;
        const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );

        widgetToolbarRepository.register( 'audio', {
            ariaLabel: t( 'Audio toolbar' ),
            items: editor.config.get( 'audio.toolbar' ) || [],
            getRelatedElement: getSelectedAudioWidget
        } );
    }
}
