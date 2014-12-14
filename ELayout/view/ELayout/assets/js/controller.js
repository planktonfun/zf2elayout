		
		// Set All required variables
		var images = [];
		var chips = [];
		var categories = [];
		var categoriesObj = [];
		var canvas = document.getElementById("electronic_map");
		var context = canvas.getContext("2d");

		// Initializer
		$(function(){
			
			loadAll( function() {
				console.log( 'all loaded' );
				
				createChips( );
				
				setInterval( gameloop, 1000/60 );
			
			});

		});

		// Load all images
		function loadAll( callback ) { 

			var container = [];
			var loaded = 0;

			// Images
			container.push("hexgrid");
			container.push("microchip");

			totalResources = container.length;
			
			$.each( container, function( index, name ) {
				images[name] = new Image();
				images[name].src = "./emap/assets/" + name + ".png";
				images[name].onload = function() { 
					
					console.log( name + ' is loaded.' ); 
					loaded++;

					if( loaded == container.length ) callback();

				};
			});

		}
		

		function gameloop() {

			canvas.width = canvas.width;

			calculateCategories();
			renderCategoriesAndChips();
			renderChips();
			renderText();

		}

		function renderCategoriesAndChips( ) {

			$.each( categoriesObj, function( ) {

				var category = this.n;
				var defaultx = this.x;
				var x = this.x;
				var y = this.y;
				var rows = 5;

				drawBorder( this.x + canvasPos.x, this.y + canvasPos.y, this.w, this.h, this.c );
				
				addText( this.n, 
					( this.x + (this.w/2) - 10 ) + canvasPos.x, 
					( this.y + this.h-10 ) + canvasPos.y,
					 15, this.c );

				$.each( chips, function( ) {

					if( this.cat == category ) {
						this.x = x + 10;
						this.y = y + 10;

						x += images['microchip'].width + 5;
						rows--;

						if( rows == 0 ) {
							rows = 5;
							x = defaultx;
							y += images['microchip'].height + 5;
						}
					}

				});

			});
		}

		function calculateCategories( ) {

			categoriesObj = [];

			var x=50, 
				y=50,
				columns = 5, 
				padding = 10, 
				category_row = 3
				max_height = 0;

			for (var category in categories ) {

				var count = categories[ category ];
				var rows = Math.ceil( count / columns ); console.log( rows );
				var width = ( images['microchip'].width * limVar( count, 1, 5 ) ) + (padding * 2);
				var height = ( images['microchip'].height * rows ) + (padding * 2);

				categoriesObj.push({
					x: x,
					y: y,
					w: width,
					h: height + 10,
					c: 'red',
					n: category
				});

				x += width + 5;

				category_row--;

				if( height > max_height ) max_height = height;
				if( category_row == 0 ) {
					category_row = 3;
					x=50;
					y += max_height + 15;
				}

			}
		}

		function renderText() {
			
			addText( "Dragging: " + dragObj.dragging + " mouse: " + dragObj.offset_x + ", " + dragObj.offset_y, 10, 20 );
			addText( "Canvas: " + canvasPos.x + ", " + canvasPos.y, 10, 40 );

		}

		function createChips() {

			var x = 100, y = 100;
			var rows = 5;

			$.each( module_list_json, function( index, value ) {

				var file_array = value.split( "/" );
				var category = file_array[1];
				var chip_name = file_array[ (file_array.length - 1) ];
				var text_size = 13;

				chips.push({
					text: chip_name,
					cat: category,
					x: x,
					y: y,
					ts: text_size
				});

				if( typeof( categories[ category ] )==='undefined' )
					categories[ category ] = 0;
				else
					categories[ category ] += 1;

				x += images['microchip'].width + 5;
				rows--;

				if( rows == 0 ) {
					rows = 5;
					x = 100;
					y += images['microchip'].height + 5;
				}
			});
			
		}

		function renderChips() {

			$.each( chips, function( ) {

				var x = this.x + canvasPos.x;
				var y = this.y + canvasPos.y;

				context.drawImage( images['microchip'], x, y, images['microchip'].width, images['microchip'].height );
				
				displayCascadingText( this.text, 9, (x+17), y + (images['microchip'].height/2), this.ts, 'white' )

			});

		}

		// Dragging
		$("#electronic_map")
		.mousedown(function( e ) {

			dragObj.setStart( e );

	        $(window).mousemove(function( e ) {
	            
	            dragObj.dragging = true;
	            dragObj.updateCanvas( e, canvasPos );

	            preventDefault(e);
	        
	        });
	    
	    })
	    .mouseup(function() {

	        dragObj.dragging = false;
	        
	        $(window).unbind("mousemove");	        
	    
	    });