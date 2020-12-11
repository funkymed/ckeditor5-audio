import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import AudioResizeCommand from './audioresizecommand';

export default class AudioResizeEditing extends Plugin {
	static get pluginName() {
		return 'AudioResizeEditing';
	}

	constructor( editor ) {
		super( editor );

		editor.config.define( 'audio', {
			resizeUnit: '%',
			resizeOptions: [ {
				name: 'audioResize:original',
				value: null,
				icon: 'original'
			},
			{
				name: 'audioResize:25',
				value: '25',
				icon: 'small'
			},
			{
				name: 'audioResize:50',
				value: '50',
				icon: 'medium'
			},
			{
				name: 'audioResize:75',
				value: '75',
				icon: 'large'
			} ]
		} );
	}

	init() {
		const editor = this.editor;
		const command = new AudioResizeCommand( editor );

		this._registerSchema();
		this._registerConverters();

		editor.commands.add( 'audioResize', command );
	}

	_registerSchema() {
		this.editor.model.schema.extend( 'audio', { allowAttributes: 'width' } );
		this.editor.model.schema.setAttributeProperties( 'width', {
			isFormatting: true
		} );
	}

	_registerConverters() {
		const editor = this.editor;

		// Dedicated converter to propagate audio's attribute to the audio tag.
		editor.conversion.for( 'downcast' ).add( dispatcher =>
			dispatcher.on( 'attribute:width:audio', ( evt, data, conversionApi ) => {
				if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
					return;
				}

				const viewWriter = conversionApi.writer;
				const figure = conversionApi.mapper.toViewElement( data.item );

				if ( data.attributeNewValue !== null ) {
					viewWriter.setStyle( 'width', data.attributeNewValue, figure );
					viewWriter.addClass( 'audio_resized', figure );
				} else {
					viewWriter.removeStyle( 'width', figure );
					viewWriter.removeClass( 'audio_resized', figure );
				}
			} )
		);

		editor.conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					name: 'figure',
					styles: {
						width: /.+/
					}
				},
				model: {
					key: 'width',
					value: viewElement => viewElement.getStyle( 'width' )
				}
			} );
	}
}
