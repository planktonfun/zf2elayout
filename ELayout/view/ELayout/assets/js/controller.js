		
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
			renderText();
			renderWires();
			
		}