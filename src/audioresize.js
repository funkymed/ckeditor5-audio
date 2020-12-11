import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import '../theme/audioresize.css';
import AudioResizeEditing from "./audioresize/audioresizeediting";
import AudioResizeHandles from "./audioresize/audioresizehandles";
import AudioResizeButtons from "./audioresize/audioresizebuttons";

export default class Audioresize extends Plugin {
    static get requires() {
        return [ AudioResizeEditing, AudioResizeHandles, AudioResizeButtons ];
    }

    static get pluginName() {
        return 'AudioResize';
    }
}
