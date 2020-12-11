import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import AudioStyleEditing from './audiostyle/audiostyleediting';
import AudioStyleUI from './audiostyle/audiostyleui';

export default class AudioStyle extends Plugin {
    static get requires() {
        return [ AudioStyleEditing, AudioStyleUI ];
    }

    static get pluginName() {
        return 'AudioStyle';
    }
}
