import first from '@ckeditor/ckeditor5-utils/src/first';
import { getViewAudioFromWidget } from './utils';


export function viewFigureToModel() {
	return dispatcher => {
		dispatcher.on( 'element:figure', converter );
	};

	function converter( evt, data, conversionApi ) {
		// Do not convert if this is not an "audio figure".
		if ( !conversionApi.consumable.test( data.viewItem, { name: true, classes: 'audio' } ) ) {
			return;
		}

		// Find an audio element inside the figure element.
		const viewAudio = getViewAudioFromWidget( data.viewItem );

		// Do not convert if audio element is absent, is missing src attribute or was already converted.
		if (!viewAudio
			|| !viewAudio.hasAttribute( 'src' )
			|| !conversionApi.consumable.test( viewAudio, { name: true } ) ) {
			return;
		}

		// Convert view audio to model audio.
		const conversionResult = conversionApi.convertItem( viewAudio, data.modelCursor );

		// Get audio element from conversion result.
		const modelAudio = first( conversionResult.modelRange.getItems() );

		// When audio wasn't successfully converted then finish conversion.
		if ( !modelAudio ) {
			return;
		}

		// Convert rest of the figure element's children as an audio children.
		conversionApi.convertChildren( data.viewItem, modelAudio );

		conversionApi.updateConversionResult( modelAudio, data );
	}
}

export function modelToViewAttributeConverter( attributeKey ) {
	return dispatcher => {
		dispatcher.on( `attribute:${ attributeKey }:audio`, converter );
	};

	function converter( evt, data, conversionApi ) {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const figure = conversionApi.mapper.toViewElement( data.item );
		const audio = getViewAudioFromWidget( figure );

		viewWriter.setAttribute( data.attributeKey, data.attributeNewValue || '', audio );
	}
}
