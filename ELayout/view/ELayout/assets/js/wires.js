		
		var pathObj = {
			tiles: [],
			isTile: function( x, y ) {
		
				if( this.tiles[x+"-"+y] !== undefined ) {
					if( this.tiles[x+"-"+y] == 1 ) {
						return true;				
					}
				}

				return false;
			},
			addTile: function( x, y ) {
				this.tiles[x+"-"+y] = 1;
			},
			removeTile: function( x, y ) {
				if(this.isTile) this.tiles[x+"-"+y] = 0;
			},
			reset: function () {
				this.tiles = [];
			}
		};

		var walls = [];
		var simulatedwalls = [];

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
						this.x1 -= 3;

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

			renderWalls( 'grey' );

			walls = [];
		}

		function renderWalls( color ) {
			for( var x in walls ) {
				for( var y in walls[x]) {
					drawRect( x, y, 1, 1, color );
				}
			}
		}

		function renderPaths( paths, w, h, color ) {
			$.each(paths, function() {

				drawLine( this.x1, this.y1, 
						  this.x2, this.y2, 
						  w, h, color );

			});
		}

		function pathFind( x1, y1, x2, y2 ) {

			var paths = [];
			var start_x = x1;
			var start_y = y1;
			var last_x = x1;
			var last_y = y1;
			var update = 0;

			last_y -= 40;

			saveLine( paths, start_x, start_y, last_x, last_y );
			saveLine( paths, x2, y2, x2, y2-39 );

			start_x = last_x;
			start_y = last_y;			
			
			update = checkPossibleDirection( last_x, last_y, x2, y2-40 );
			makeWalls( update );

			checkPossibleDirection( 200, 1, 205, 50, 'lightblue' );

			return paths; 
		}

		function makeWalls( points ) {
			$.each( points, function(){
				walls[this.x] = walls[this.x] || [];
				walls[this.x][this.y] = 1;
			});
		}

		function checkPossibleDirection( x1, y1, x2, y2, color ) {

			pathObj.reset();

			var start_x = x1;
			var start_y = y1;
			var steps = 0;
			var updated = [];
			var final_path = [];
			var updated_index = [];
			
			for( var i = 8000; i > 0; i--) 
			{
				pathObj.addTile( x1, y1 );
				
				steps++;

				updated[ steps ] = step( x1, y1, x2, y2, start_x, start_y, color, false );

				if( !updated[ steps ] ) return false;

				x1 = updated[ steps ].x;
				y1 = updated[ steps ].y;

				updated_index[ x1 + "," + y1 ] = { g:updated[ steps ].g, d:updated[ steps ].d, id:steps, x:x1, y:y1 };
				
				if(x1==x2 && y1==y2) break;

				// if( color == 'lightblue' ) if( steps > debug ) debug = steps;
			}

			if( color == 'lightblue' ) {

				var path_count = 0;

				for( var i = steps; i > 0; i--)
				{
					if( pathObj.isTile( updated[ i ].x, updated[ i ].y ) ) {

						path_count++;

						// count adjust tiles, if one only, render
						// check their distances
						var at = countAdjacentTiles( updated[ i ].x, updated[ i ].y, updated_index );

						// render
						if( at['count'] > 1 ) {

							final_path[ path_count ] = { x: updated[ at['id'] ].x,  y: updated[ at['id'] ].y };

							drawRect( updated[ at['id'] ].x, updated[ at['id'] ].y, 1, 1, 'gold' );
							
							pathObj.removeTile( updated[ at['id'] ].x, updated[ at['id'] ].y );

						} else {

							final_path[ path_count ] = { x: updated[ i ].x, y: updated[ i ].y };

							drawRect( updated[ i ].x, updated[ i ].y, 1, 1, 'gold' );

							pathObj.removeTile( updated[ i ].x, updated[ i ].y );

						}

					}

					if(updated[ i ].x==start_x && updated[ i ].y==start_y) {
						break;
					}
				}
			}

			return updated;
		}

		function countAdjacentTiles( x, y, updated_index ) {
			
			var count = 0;
			var list = [];
			var result = [];

			if( pathObj.isTile(x+1, y) ){ 
				count++;
				list.push( updated_index[(x+1) + "," + y] );
			}

			if( pathObj.isTile(x+1, y+1) ){ 
				count++;
				list.push(updated_index[(x+1) + "," + (y+1)]);
			}

			if( pathObj.isTile(x+1, y-1) ){ 
				count++;
				list.push(updated_index[(x+1) + "," + (y-1)]);
			}

			if( pathObj.isTile(x-1, y ) ){ 
				count++;
				list.push(updated_index[(x-1) + "," +  y ]);
			}

			if( pathObj.isTile(x-1, y+1) ){ 
				count++;
				list.push(updated_index[(x-1) + "," +  (y+1)]);
			}

			if( pathObj.isTile(x-1, y-1) ){ 
				count++;
				list.push(updated_index[(x-1) + "," +  (y-1)]);
			}

			if( pathObj.isTile(x, y+1) ){ 
				count++;
				list.push(updated_index[x + "," +  (y+1)]);
			}

			if( pathObj.isTile(x, y-1) ){ 
				count++;
				list.push(updated_index[x + "," +  (y-1)]);
			}

			var initial = 0;
			var id = 0;

			$.each( list, function( index, value ) {
				this.d = this.d || false;

				if( this.d ) {
					if( initial == 0 ) initial = this.d;
					if( initial >= this.d ) {
						initial = this.d;
						id = this.id;
					}
				}
			});

			result['id'] = id;
			result['count'] = count;

			return result;
		}

		function step( x1, y1, x2, y2, start_x, start_y, color, diagonals ) {

			var diagonals = diagonals || false;
			var color = color || 'violet';
			var options = [];
			var right = Infinity;
			var left = Infinity;
			var down = Infinity;
			var up = Infinity;

			var px = x1;
			var py = y1;

			px = x1 + 1;
			
			options = checkStep( options, px, py, x2, y2, start_x, start_y );

			if( diagonals ) {
				py = y1 + 1;
				
				options = checkStep( options, px, py, x2, y2, start_x, start_y );

				py = y1 - 2;
				
				options = checkStep( options, px, py, x2, y2, start_x, start_y );
			}

			px = x1;
			py = y1;

			px = x1 - 1;
			
			options = checkStep( options, px, py, x2, y2, start_x, start_y );

			if( diagonals ) {
				py = y1 + 1;
				
				options = checkStep( options, px, py, x2, y2, start_x, start_y );

				py = y1 - 2;
				
				options = checkStep( options, px, py, x2, y2, start_x, start_y );
			}

			px = x1;
			py = y1;
			
			py = y1 + 1;
			
			options = checkStep( options, px, py, x2, y2, start_x, start_y );

			py = y1 - 1;
			
			options = checkStep( options, px, py, x2, y2, start_x, start_y );

			nearest = sortArrayDesc( options );

			result = options[ nearest[0] ] || false;

			// if( result != false ) drawRect( options[ nearest[0] ].x, options[ nearest[0] ].y, 1, 1, color );

			return result;
		}

		function sortArrayDesc( options ) {
			var min = [];

			for( var index in options ) {
				min.push( index );
			};
		    
		    min.sort(function(a,b){return a-b;});
			
			return min;
		}

		function sortArrayAsc( options ) {
			var min = [];

			for( var index in options ) {
				min.push( index );
			};
		    
		    min.sort(function(a,b){return b-a;});
			
			return min;
		}

		function checkStep( options, px, py, x2, y2, origin_x, origin_y ) {
			if( !isWall( px, py ) ) {
				to = getDistance( { x:px, y:py }, { x:x2, y:y2 });
				from = getDistance( { x:px, y:py }, { x:origin_x, y:origin_y });
				bestpath = to;

				options[ bestpath ] = {
					x: px, 
					y: py,
					d: to,
					g: from,
					f: bestpath
				};

			}

			return options;
		}

		function isWall( x, y ) {
		
			if( walls[x] !== undefined ) {
				if( walls[x][y] !== undefined ) {
					if( walls[x][y] == 1 ) {
						return true;
					}				
				}
			}

			if(pathObj.isTile(x,y)) return true;

			return false;
		}

		function saveLine( paths, start_x, start_y, last_x, last_y ) {
			paths.push({ 
				x1: start_x, y1: start_y, 
				x2: last_x, y2: last_y 
			});

			saveWallLine( start_x, start_y, last_x, last_y );
		}

		function saveWallLine( x1, y1, x2, y2 ) {

			var start = 0;
			var end = 0;

			if( x1 == x2 ) {

				if( y1 > y2 ) {	
					start = y2;
					end = y1;
				} else {
					start = y1;
					end = y2;
				}

				for( var i=start; end>i; i++)
				{
					walls[x1] = walls[x1] || [];
					walls[x1][i] = 1;
				}

			} else if( y1 == y2 )  {

				if( x1 > x2 ) {	
					start = x2;
					end = x1;
				} else {
					start = x1;
					end = x2;
				}

				for( var i=start; end>i; i++)
				{
					walls[i] = walls[i] || [];
					walls[i][y1] = 1;
				}
			
			} else {

				console.log( 'Line not given' );

				return false;
			}

		}