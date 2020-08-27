/**
 * WordPress dependencies
 */
import { createContext, useContext, useEffect } from '@wordpress/element';
import { useEntityProp } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { getGlobalStyles } from './global-styles-renderer';

const GlobalStylesContext = createContext( {
	/* eslint-disable no-unused-vars */
	getProperty: ( context, family, name ) => {},
	setProperty: ( context, family, name, value ) => {},
	globalContext: {},
	/* eslint-enable no-unused-vars */
} );

export const useGlobalStylesContext = () => useContext( GlobalStylesContext );

export default ( { children, baseStyles, contexts } ) => {
	const {
		userStyles,
		getProperty,
		setProperty,
	} = useGlobalStylesFromEntities();

	useGlobalStylesEffectToUpdateStylesheet( contexts, baseStyles, userStyles );

	return (
		<GlobalStylesContext.Provider
			value={ {
				getProperty,
				setProperty,
				contexts,
			} }
		>
			{ children }
		</GlobalStylesContext.Provider>
	);
};

/**
 * Hook that exposes an API to retrieve and update user styles.
 *
 * @param {number} entityId Entity that stores the user data as CPT.
 *
 * @return {Object} User data as well as getters and setters.
 */
const useGlobalStylesFromEntities = () => {
	const [ content, setContent ] = useEntityProp(
		'postType',
		'wp_global_styles',
		'content'
	);
	const userStyles = content ? JSON.parse( content ) : {};

	const getProperty = ( context, family, name ) =>
		userStyles?.[ context ]?.styles?.[ family ]?.[ name ];

	const setProperty = ( context, family, name, value ) =>
		setContent(
			JSON.stringify( {
				...userStyles,
				[ context ]: {
					styles: {
						...userStyles?.[ context ]?.styles,
						[ family ]: {
							...userStyles?.[ context ]?.styles?.[ family ],
							[ name ]: value,
						},
					},
				},
			} )
		);

	return {
		userStyles,
		getProperty,
		setProperty,
	};
};

const useGlobalStylesEffectToUpdateStylesheet = (
	contexts,
	baseStyles,
	userStyles
) => {
	useEffect( () => {
		const embeddedStylesheetId = 'global-styles-inline-css';
		let styleNode = document.getElementById( embeddedStylesheetId );

		if ( ! styleNode ) {
			styleNode = document.createElement( 'style' );
			styleNode.id = embeddedStylesheetId;
			document
				.getElementsByTagName( 'head' )[ 0 ]
				.appendChild( styleNode );
		}

		styleNode.innerText = getGlobalStyles(
			contexts,
			baseStyles,
			userStyles
		);
	}, [ userStyles ] );
};
