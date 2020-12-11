export function createAudioMediaTypeRegExp(types) {
    const regExpSafeNames = types.map(type => type.replace('+', '\\+'));
    return new RegExp(`^audio\\/(${regExpSafeNames.join('|')})$`);
}

export function isHtmlIncluded( dataTransfer ) {
    return Array.from( dataTransfer.types ).includes( 'text/html' ) && dataTransfer.getData( 'text/html' ) !== '';
}

export function fetchLocalAudio( audio ) {
    return new Promise( ( resolve, reject ) => {
        const audioSrc = audio.getAttribute( 'src' );

        // Fetch works asynchronously and so does not block browser UI when processing data.
        fetch( audioSrc )
            .then( resource => resource.blob() )
            .then( blob => {
                const mimeType = getAudioMimeType( blob, audioSrc );
                const ext = mimeType.replace( 'audio/', '' );
                const filename = `audio.${ ext }`;
                const file = new File( [ blob ], filename, { type: mimeType } );

                resolve( file );
            } )
            .catch( reject );
    } );
}

export function isLocalAudio( node ) {
    if ( !node.is( 'element', 'audio' ) || !node.getAttribute( 'src' ) ) {
        return false;
    }

    return node.getAttribute( 'src' ).match( /^data:audio\/\w+;base64,/g ) ||
        node.getAttribute( 'src' ).match( /^blob:/g );
}

function getAudioMimeType( blob, src ) {
    if ( blob.type ) {
        return blob.type;
    } else if ( src.match( /data:(audio\/\w+);base64/ ) ) {
        return src.match( /data:(audio\/\w+);base64/ )[ 1 ].toLowerCase();
    } else {
        // Fallback to 'mp4' as common extension.
        return 'audio/mp3';
    }
}

export function getAudiosFromChangeItem( editor, item ) {
    return Array.from( editor.model.createRangeOn( item ) )
        .filter( value => value.item.is( 'element', 'audio' ) )
        .map( value => value.item );
}
