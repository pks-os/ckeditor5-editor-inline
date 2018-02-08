/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import InlineEditorUIView from '../src/inlineeditoruiview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';

describe( 'InlineEditorUIView', () => {
	let locale, view;

	beforeEach( () => {
		locale = new Locale( 'en' );
		view = new InlineEditorUIView( locale );
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		describe( '#toolbar', () => {
			it( 'is created', () => {
				expect( view.toolbar ).to.be.instanceof( ToolbarView );
			} );

			it( 'is given a locale object', () => {
				expect( view.toolbar.locale ).to.equal( locale );
			} );

			it( 'is given the right CSS classes', () => {
				expect( view.toolbar.element.classList.contains( 'ck-editor-toolbar' ) ).to.be.true;
				expect( view.toolbar.element.classList.contains( 'ck-toolbar_floating' ) ).to.be.true;
			} );

			it( 'sets the default value of the #viewportTopOffset attribute', () => {
				expect( view.viewportTopOffset ).to.equal( 0 );
			} );
		} );

		describe( '#panel', () => {
			it( 'is created', () => {
				expect( view.panel ).to.be.instanceof( BalloonPanelView );
			} );

			it( 'is given a locale object', () => {
				expect( view.panel.locale ).to.equal( locale );
			} );

			it( 'is given the right CSS class', () => {
				expect( view.panel.element.classList.contains( 'ck-toolbar-container' ) ).to.be.true;
			} );

			it( 'is put into the #body collection', () => {
				expect( view.body.get( 0 ) ).to.equal( view.panel );
			} );

			it( 'gets view.panel#withArrow set', () => {
				expect( view.panel.withArrow ).to.be.false;
			} );
		} );

		describe( '#editable', () => {
			it( 'is created', () => {
				expect( view.editable ).to.be.instanceof( InlineEditableUIView );
			} );

			it( 'is given a locate object', () => {
				expect( view.editable.locale ).to.equal( locale );
			} );

			it( 'is registered as a child', () => {
				const spy = sinon.spy( view.editable, 'destroy' );

				view.destroy();
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'init()', () => {
		it( 'appends #toolbar to panel#content', () => {
			const view = new InlineEditorUIView( locale );

			expect( view.panel.content ).to.have.length( 0 );

			view.render();
			expect( view.panel.content.get( 0 ) ).to.equal( view.toolbar );

			view.destroy();
		} );
	} );

	describe( 'editableElement', () => {
		it( 'returns editable\'s view element', () => {
			expect( view.editableElement.getAttribute( 'contentEditable' ) ).to.equal( 'true' );
			view.destroy();
		} );
	} );

	describe( 'panelPositions', () => {
		let viewportRect;

		beforeEach( () => {
			viewportRect = {
				top: 0,
				bottom: 1000,
				left: 0,
				right: 1000,
				width: 1000,
				height: 1000
			};
		} );

		it( 'returns the positions in the right order', () => {
			const positions = view.panelPositions;
			const editableRect = {
				top: 100,
				bottom: 200,
				left: 100,
				right: 100,
				width: 100,
				height: 100
			};
			const panelRect = {
				width: 50,
				height: 50
			};

			expect( positions ).to.have.length( 2 );
			expect( positions[ 0 ]( editableRect, panelRect ).name ).to.equal( 'toolbar_west' );
			expect( positions[ 1 ]( editableRect, panelRect ).name ).to.equal( 'toolbar_east' );
		} );

		describe( 'west', () => {
			testTopPositions( 0, 100 );
		} );

		describe( 'east', () => {
			testTopPositions( 1, 150 );
		} );

		function testTopPositions( positionIndex, expectedLeft ) {
			it( 'positions the panel above editable when there\'s enough space', () => {
				const position = view.panelPositions[ positionIndex ];
				const editableRect = {
					top: 101, // !
					bottom: 200,
					left: 100,
					right: 100,
					width: 100,
					height: 100
				};
				const panelRect = {
					width: 50,
					height: 100 // !
				};

				const { top, left } = position( editableRect, panelRect, viewportRect );

				expect( top ).to.equal( 1 );
				expect( left ).to.equal( expectedLeft );
			} );

			it( 'positions the panel below the editable when there\'s not enough space above (1)', () => {
				const position = view.panelPositions[ positionIndex ];
				const editableRect = {
					top: 100, // !
					bottom: 300,
					left: 100,
					right: 100,
					width: 100,
					height: 200
				};
				const panelRect = {
					width: 50,
					height: 100 // !
				};

				const { top, left } = position( editableRect, panelRect, viewportRect );

				expect( top ).to.equal( 300 );
				expect( left ).to.equal( expectedLeft );
			} );

			it( 'positions the panel below the editable when there\'s not enough space above (2)', () => {
				const position = view.panelPositions[ positionIndex ];
				const editableRect = {
					top: 99, // !
					bottom: 300,
					left: 100,
					right: 100,
					width: 100,
					height: 200
				};
				const panelRect = {
					width: 50,
					height: 100 // !
				};

				const { top, left } = position( editableRect, panelRect, viewportRect );

				expect( top ).to.equal( 300 );
				expect( left ).to.equal( expectedLeft );
			} );

			it( 'positions the panel over the editable when there\'s not enough space above and below', () => {
				const position = view.panelPositions[ positionIndex ];
				const editableRect = {
					top: 99, // !
					bottom: 299,
					left: 100,
					right: 100,
					width: 100,
					height: 200
				};
				const panelRect = {
					width: 50,
					height: 100 // !
				};

				viewportRect.height = 398; // !

				const { top, left } = position( editableRect, panelRect, viewportRect );

				expect( top ).to.equal( 0 );
				expect( left ).to.equal( expectedLeft );
			} );

			it( 'positions the panel below the editable when there\'s not enough space above/over', () => {
				const position = view.panelPositions[ positionIndex ];
				const editableRect = {
					top: 50,
					bottom: 150, // !
					left: 100,
					right: 100,
					width: 100,
					height: 100
				};
				const panelRect = {
					width: 50,
					height: 100 // !
				};

				const { top, left } = position( editableRect, panelRect, viewportRect );

				expect( top ).to.equal( 150 );
				expect( left ).to.equal( expectedLeft );
			} );

			describe( 'view#viewportTopOffset', () => {
				it( 'sticks the panel to the offset when there\'s not enough space above and below', () => {
					view.viewportTopOffset = 50;

					const position = view.panelPositions[ positionIndex ];
					const editableRect = {
						top: 0, // !
						bottom: 200,
						left: 100,
						right: 100,
						width: 100,
						height: 200
					};
					const panelRect = {
						width: 50,
						height: 50
					};

					viewportRect.height = 249; // !

					const { top, left } = position( editableRect, panelRect, viewportRect );

					expect( top ).to.equal( 50 );
					expect( left ).to.equal( expectedLeft );
				} );

				it( 'positions the panel below the editable when there\'s not enough space above/over', () => {
					view.viewportTopOffset = 50;

					const position = view.panelPositions[ positionIndex ];
					const editableRect = {
						top: 100,
						bottom: 150,
						left: 100,
						right: 100,
						width: 100,
						height: 50
					};
					const panelRect = {
						width: 50,
						height: 80
					};

					const { top, left } = position( editableRect, panelRect, viewportRect );

					expect( top ).to.equal( 150 );
					expect( left ).to.equal( expectedLeft );
				} );
			} );
		}
	} );
} );
