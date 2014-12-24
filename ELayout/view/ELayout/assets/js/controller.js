		
		// Set All required variables
		var images = [];
		var chips = [];
		var wires = [];
		var pathsdrawn = [];
		var categories = [];
		var categoriesObj = [];		
		var canvas = document.getElementById("electronic_map");
		var context = canvas.getContext("2d");
		var stop = false;

		// Initializer
		$(function(){
			
			loadAll( function() {
				console.log( 'all loaded' );
				
				createChips( );
				createWires( );
				
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

			if( stop ) return;

			canvas.width = canvas.width;
			
			renderCategoriesAndChips();
			renderChips();
			// renderText();
			renderWires();
			
		}

		function createWires() {
			$.each( linked_list_json, function( module, links ) {
				$.each( links, function( index, value ) {
					if( module != value ) {
						wires.push({
							x1: 0, y1: 0,
							x2: 0, y2: 0,
							w: 1,
							h: 1,
							color: 'gold',
							to: value,
							from: module
						});
					}
				});
			});
		}

		function transformWires() {

			$.each( wires, function(){
				
				var chip_from = getChipName( this.from );

				this.x1 = chip_from.x + (images['microchip'].width/2) + canvasPos.x;
				this.y1 = chip_from.y + canvasPos.y;

				var chip_to = getChipName( this.to );

				this.x2 = chip_to.x + (images['microchip'].width/2) + canvasPos.x;
				this.y2 = chip_to.y + canvasPos.y;

			});	
		}

		function adjustWireStartPoint( ) {

			var checker = wires;
			var adjusted = true;

			while( adjusted ) {

				adjusted = false;

				$.each( wires, function( ) {
					
					var collision_count = 0;
					var x1 = this.x1;
					var y1 = this.y1;
					var x2 = this.x2;
					var y2 = this.y2;

					$.each(checker, function() {
						if( x1 == this.x1 && y1 == this.y1 ) collision_count++;
					});

					if( collision_count > 1 ) {
						this.x1 += 3;

						adjusted = true;
					}

					collision_count = 0;

					$.each(checker, function() {
						if( x2 == this.x2 && y2 == this.y2 ) collision_count++;
					});

					if( collision_count > 1 ) {
						this.x2 -= 3;

						adjusted = true;
					}

				});
			}
		}

		function getChipName( name ) {

			var finding = false;

			$.each( chips, function() {
				if( this.text == name ) {
					finding = this;
				}
			
			});

			return finding;
		}

		function renderWires() {
			transformWires( );
			adjustWireStartPoint( );

			$.each( wires, function() {

				var paths = pathFind( this.x1, this.y1, this.x2, this.y2 );

				renderPaths( paths, this.w, this.h, this.color );

			});

			pathsdrawn = [];
		}

		function renderPaths( paths, w, h, color ) {
			$.each(paths, function() {

				drawLine( this.x1, this.y1, 
						  this.x2, this.y2, 
						  w, h, color );

			});

			pathsdrawn.push( paths );

		}

		function pathFind( x1, y1, x2, y2 ) {

			function save( ) {
				paths.push({ 
					x1: start_x, y1: start_y, 
					x2: last_x, y2: last_y 
				});

				start_x = last_x;
				start_y = last_y;
			}

			function collisionCheck( ) {
				$.each( pathsdrawn, function( index, value ){
					$.each( value, function() {

						var threshold = 0;

						while( lineIntersect({ 
							x1:start_x,
							y1:start_y,
							x2:last_x,
							y2:last_y 
						},{ x1: this.x1,
							y1: this.y1,
							x2: this.x2,
							y2: this.y2 }) ) 
						{
							last_y += 3;
							threshold++;

							if( threshold > 10 ) {
								break;
							}
						}

					});				
				});
			
			}

			var paths = [];
			var start_x = x1;
			var start_y = y1;
			var last_x = x1;
			var last_y = y1;

			last_y -= 40;

			collisionCheck( );
			save( );			
			
			while( last_x != x2 ) {
				if( last_x > x2 ) {
					last_x -= 1;
				} else {
					last_x += 1;
				}
			}

			save( );

			while( last_y != y2 ) {
				if( last_y > y2 ) {
					last_y -= 1;
				} else {
					last_y += 1;
				}
			}

			save( );		

			return paths; 
		}

		function renderCategoriesAndChips( ) {

			calculateCategories();

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
				var rows = Math.ceil( count / columns );
				var width = ( images['microchip'].width * ( limVar( count, 1, 5 ) ) ) + (padding * 2) + ( 5 * limVar( count, 1, 5 ) );
				var height = ( images['microchip'].height * rows ) + (padding * 2) + ( 5 * rows );

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
					categories[ category ] = 1;
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