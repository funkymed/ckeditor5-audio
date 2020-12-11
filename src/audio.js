import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import AudioEditing from "./audio/audioediting";
import '../theme/audio.css';

export default class Audio extends Plugin {
    static get requires() {
        return [ AudioEditing, Widget];
    }

    static get pluginName() {
        return 'Audio';
    }
}
