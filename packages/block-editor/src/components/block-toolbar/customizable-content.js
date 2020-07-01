/**
 * External dependencies
 */
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { throttle } from 'lodash';

/**
 * WordPress dependencies
 */
import { useRef, useState, useEffect, useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import BlockToolbarContents from '../block-toolbar-contents';

export default function CustomizableBlockToolbarContent( {
	children,
	className,
} ) {
	return (
		<BlockToolbarContents.Slot>
			{ ( fills ) => (
				<CustomizableBlockToolbarContentChildren
					className={ className }
					fills={ fills }
				>
					{ children }
				</CustomizableBlockToolbarContentChildren>
			) }
		</BlockToolbarContents.Slot>
	);
}

function CustomizableBlockToolbarContentChildren( {
	fills,
	className = '',
	children,
} ) {
	const containerRef = useRef();
	const fillsRef = useRef();
	const toolbarRef = useRef();
	const [ dimensions, setDimensions ] = useState( {} );

	const fillsPropRef = useRef();
	fillsPropRef.current = fills;
	const resize = useCallback(
		throttle( ( elem ) => {
			if ( ! elem ) {
				elem = fillsPropRef.current.length
					? fillsRef.current
					: toolbarRef.current;
			}
			if ( ! elem ) {
				return;
			}
			elem.style.position = 'absolute';
			elem.style.width = 'auto';
			const css = window.getComputedStyle( elem, null );
			setDimensions( {
				width: css.getPropertyValue( 'width' ),
				height: css.getPropertyValue( 'height' ),
			} );
			elem.style.position = '';
			elem.style.width = '';
		}, 100 ),
		[]
	);

	useEffect( () => {
		// Create an observer instance linked to the callback function
		const observer = new MutationObserver( function ( mutationsList ) {
			const hasChildList = mutationsList.find(
				( { type } ) => type === 'childList'
			);
			if ( hasChildList ) {
				resize();
			}
		} );

		// Start observing the target node for configured mutations
		observer.observe( containerRef.current, {
			childList: true,
			subtree: true,
		} );

		return () => observer.disconnect();
	}, [] );

	return (
		<div
			className="block-editor-block-toolbar-width-container"
			ref={ containerRef }
			style={ dimensions }
		>
			<TransitionGroup>
				{ fills.length ? (
					<CSSTransition
						key="fills"
						timeout={ 300 }
						classNames="block-editor-block-toolbar-content"
					>
						<div className={ className } ref={ fillsRef }>
							{ fills }
						</div>
					</CSSTransition>
				) : (
					<CSSTransition
						key="default"
						timeout={ 300 }
						classNames="block-editor-block-toolbar-content"
					>
						<div className={ className } ref={ toolbarRef }>
							{ children }
						</div>
					</CSSTransition>
				) }
			</TransitionGroup>
		</div>
	);
}
