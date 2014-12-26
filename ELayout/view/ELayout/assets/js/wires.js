		function createWires() {
			$.each( linked_list_json, function( module, links ) {
				$.each( links, function( index, value ) {
					if( module != value ) {
						wires.push({
							x1: 0, y1: 0,
							x2: 0, y2: 0,
							w: 1,
							h: 1,
							color: 'black',
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

			function collides( ) {

				var collision = false;

				$.each( pathsdrawn, function( index, value ){
					$.each( value, function() {

						var line1 = { 
							x1:start_x,
							y1:start_y,
							x2:last_x,
							y2:last_y 
						};

						var line2 = { 
							x1: this.x1,
							y1: this.y1,
							x2: this.x2,
							y2: this.y2 
						}; 

						if( lineIntersect(line1,line2) ) {
							collision = true;
						}

					});				
				});

				return collision;			
			}

			function changeDirection( )
			{
				last_x--;
				
				if( !collides( ) ) {
					xvel = -1;

					return true;
				}
				
				last_x+=2;

				if( !collides( ) ) {
					xvel = 1;

					return true;
				}

				last_x--;
				last_y++;

				if( !collides( ) ) {
					yvel = 1;

					return true;
				}

				last_y-=2

				if( !collides( ) ) {
					yvel = -1;

					return true;
				}

				xvel = 0;
				yvel = 0;

				return false;
			}

			var paths = [];
			var start_x = x1;
			var start_y = y1;
			var last_x = x1;
			var last_y = y1;
			var xvel = 0;
			var yvel = 0;
			var treshold = 0;

			last_y -= 40;

			save( );			
			
			while( last_x != x2 ) 
			{
				if( last_x > x2 ) {
					last_x -= 1;
				} else {
					last_x += 1;
				}
			}

			save( );

			while( last_y != y2 ) 
			{
				if( last_y > y2 ) {
					last_y -= 1;
				} else {
					last_y += 1;
				}
			}

			save( );		

			return paths; 
		}