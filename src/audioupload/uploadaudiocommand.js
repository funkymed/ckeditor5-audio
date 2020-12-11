import Command from "@ckeditor/ckeditor5-core/src/command";
import FileRepository from "@ckeditor/ckeditor5-upload/src/filerepository";
import {insertAudio, isAudioAllowed} from "../audio/utils";

function uploadAudio( writer, model, fileRepository, file ) {
    const loader = fileRepository.createLoader( file );

    if ( !loader ) {
        return;
    }

    insertAudio( writer, model, { uploadId: loader.id } );
}

export default class Uploadaudiocommand extends Command {
    execute( options ) {
        const editor = this.editor;
        const model = editor.model;

        const fileRepository = editor.plugins.get( FileRepository );

        model.change( writer => {
            const filesToUpload = Array.isArray( options.files ) ? options.files : [ options.files ];

            for ( const file of filesToUpload ) {
                uploadAudio( writer, model, fileRepository, file );
            }
        } );
    }

    refresh() {
        const audioElement = this.editor.model.document.selection.getSelectedElement();
        const isAudio = audioElement && audioElement.name === 'audio' || false;

        this.isEnabled = isAudioAllowed( this.editor.model ) || isAudio;
    }
}
