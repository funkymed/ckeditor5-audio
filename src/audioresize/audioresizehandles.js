import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import WidgetResize from '@ckeditor/ckeditor5-widget/src/widgetresize';

export default class AudioResizeHandles extends Plugin {
	static get requires() {
		return [ WidgetResize ];
	}

	static get pluginName() {
		return 'AudioResizeHandles';
	}

	init() {
		const editor = this.editor;
		const command = editor.commands.get( 'audioResize' );

		this.bind( 'isEnabled' ).to( command );

		editor.editing.downcastDispatcher.on( 'insert:audio', ( evt, data, conversionApi ) => {
			const widget = conversionApi.mapper.toViewElement( data.item );

			const resizer = editor.plugins
				.get( WidgetResize )
				.attachTo( {
					unit: editor.config.get( 'audio.resizeUnit' ),

					modelElement: data.item,
					viewElement: widget,
					editor,

					getHandleHost( domWidgetElement ) {
						return domWidgetElement.querySelector( 'audio' );
					},
					getResizeHost( domWidgetElement ) {
						return domWidgetElement;
					},
					// TODO consider other positions.
					isCentered() {
						const audioStyle = data.item.getAttribute( 'audioStyle' );

						return !audioStyle || audioStyle === 'full' || audioStyle === 'alignCenter';
					},

					onCommit( newValue ) {
						editor.execute( 'audioResize', { width: newValue } );
					}
				} );

			resizer.on( 'updateSize', () => {
				if ( !widget.hasClass( 'audio_resized' ) ) {
					editor.editing.view.change( writer => {
						writer.addClass( 'audio_resized', widget );
					} );
				}
			} );

			resizer.bind( 'isEnabled' ).to( this );
		}, { priority: 'low' } );
	}
}
