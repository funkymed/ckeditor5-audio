import { findOptimalInsertionPosition, isWidget, toWidget } from '@ckeditor/ckeditor5-widget/src/utils';

export function toAudioWidget( viewElement, writer) {
	writer.setCustomProperty( 'audio', true, viewElement );

	return toWidget( viewElement, writer, {} );
}

export function isAudioWidget( viewElement ) {
	return !!viewElement.getCustomProperty( 'audio' ) && isWidget( viewElement );
}

export function getSelectedAudioWidget( selection ) {
	const viewElement = selection.getSelectedElement();

	if ( viewElement && isAudioWidget( viewElement ) ) {
		return viewElement;
	}

	return null;
}

export function isAudio( modelElement ) {
	return !!modelElement && modelElement.is( 'element', 'audio' );
}

export function insertAudio( writer, model, attributes = {} ) {
	attributes.controls = 'controls';
	const audioElement = writer.createElement( 'audio', attributes );

	const insertAtSelection = findOptimalInsertionPosition( model.document.selection, model );

	model.insertContent( audioElement, insertAtSelection );

	if ( audioElement.parent ) {
		writer.setSelection( audioElement, 'on' );
	}
}

export function isAudioAllowed( model ) {
	const schema = model.schema;
	const selection = model.document.selection;

	return isAudioAllowedInParent( selection, schema, model ) &&
		!checkSelectionOnObject( selection, schema ) &&
		isInOtherAudio( selection );
}

export function getViewAudioFromWidget( figureView ) {
	const figureChildren = [];

	for ( const figureChild of figureView.getChildren() ) {
		figureChildren.push( figureChild );

		if ( figureChild.is( 'element' ) ) {
			figureChildren.push( ...figureChild.getChildren() );
		}
	}

	return figureChildren.find( viewChild => viewChild.is( 'element', 'audio' ) );
}

function isAudioAllowedInParent( selection, schema, model ) {
	const parent = getInsertAudioParent( selection, model );

	return schema.checkChild( parent, 'audio' );
}

function checkSelectionOnObject( selection, schema ) {
	const selectedElement = selection.getSelectedElement();

	return selectedElement && schema.isObject( selectedElement );
}

function isInOtherAudio( selection ) {
	return [ ...selection.focus.getAncestors() ].every( ancestor => !ancestor.is( 'element', 'audio' ) );
}

function getInsertAudioParent( selection, model ) {
	const insertAt = findOptimalInsertionPosition( selection, model );

	const parent = insertAt.parent;

	if ( parent.isEmpty && !parent.is( 'element', '$root' ) ) {
		return parent.parent;
	}

	return parent;
}
