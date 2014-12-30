		
		var pathObj = {
			tiles: [],
			walls: [],
			steplimit: 8000,
			isWall: function( x, y ) { 

				if( this.walls[x+"-"+y] !== undefined )
					if( this.walls[x+"-"+y].type == 1 || this.walls[x+"-"+y].type == 2 )
						return true;
				
				if(this.isTile(x,y)) return true;

				return false;
			},
			addWall: function( x, y, type ) {
				var type = type || 1; 

				this.walls[x+"-"+y] = { x:x, y:y, type: type };

			},
			resetWalls: function () {
				this.walls = [];
			},
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
			resetTiles: function () {
				this.tiles = [];
			},
			checkPossibleDirection: function( x1, y1, x2, y2, color ) {

				this.resetTiles();

				var start_x = x1;
				var start_y = y1;
				var steps = 0;
				var updated = [];
				var updated_index = [];
				
				for( var i = this.steplimit; i > 0; i--) 
				{
					this.addTile( x1, y1 );
					
					steps++;

					updated[ steps ] = this.step( x1, y1, x2, y2, start_x, start_y, color, false );

					if( !updated[ steps ] ) return false;

					x1 = updated[ steps ].x;
					y1 = updated[ steps ].y;

					updated_index[ x1 + "," + y1 ] = { g:updated[ steps ].g, d:updated[ steps ].d, id:steps, x:x1, y:y1 };

					if(x1==x2 && y1==y2) break;

				}

				final_path = this.calculateFromPossibilities( start_x, start_y, steps, updated, updated_index, color );

				return final_path;
			},

			calculateFromPossibilities: function( start_x, start_y, steps, updated, updated_index, color ) {
				var path_count = 0;
				var switched = false;
				var switchObj = { x: false, y: false };
				var limit = 5;
				var final_path = [];

				for( var i = steps; i > 0; i--)
				{
					if( this.isTile( updated[ i ].x, updated[ i ].y ) ) {

						path_count++;

						if( !switched ) {
							
							var at = this.countAdjacentTiles( updated[ i ].x, updated[ i ].y, updated_index );

							if( at['count'] > 1 ) {

								final_path[ path_count ] = { x: updated[ at['id'] ].x,  y: updated[ at['id'] ].y };
								
								this.removeTile( updated[ at['id'] ].x, updated[ at['id'] ].y );

								switched = true;
								switchObj.x = final_path[ path_count ].x; 
								switchObj.y = final_path[ path_count ].y; 

							} else {

								final_path[ path_count ] = { x: updated[ i ].x, y: updated[ i ].y };
		                        
								this.removeTile( updated[ i ].x, updated[ i ].y );

							}

						} else {

							var at = this.countAdjacentTiles( switchObj.x, switchObj.y, updated_index );

							if( at['id'] != 0 ) {

								final_path[ path_count ] = { x: updated[ at['id'] ].x,  y: updated[ at['id'] ].y };
									
								this.removeTile( updated[ at['id'] ].x, updated[ at['id'] ].y );

								switchObj.x = final_path[ path_count ].x;
								switchObj.y = final_path[ path_count ].y;

							} else {
								limit = 0;
							}
						}
						
						if( limit == 0 ) break;
						else if( color == 'lightblue' ) drawRect( final_path[ path_count ].x, final_path[ path_count ].y, 1, 1, 'black' );

					}

					if(updated[ i ].x==start_x && updated[ i ].y==start_y) {
						
						this.removeTile( updated[ i ].x, updated[ i ].y );

						break;
					}
				}

				return final_path;
			},

			countAdjacentTiles: function( x, y, updated_index, diagonal ) {
				
				var diagonal = diagonal || false;
				var count = 0;
				var list = [];
				var result = [];

				if( this.isTile(x+1, y) ){ 
					count++;
					list.push( updated_index[(x+1) + "," + y] );
				}

				if( diagonal ) {
					if( this.isTile(x+1, y+1) ){ 
						count++;
						list.push(updated_index[(x+1) + "," + (y+1)]);
					}

					if( this.isTile(x+1, y-1) ){ 
						count++;
						list.push(updated_index[(x+1) + "," + (y-1)]);
					}
				}

				if( this.isTile(x-1, y ) ){ 
					count++;
					list.push(updated_index[(x-1) + "," +  y ]);
				}

				if( diagonal ) {
					if( this.isTile(x-1, y+1) ){ 
						count++;
						list.push(updated_index[(x-1) + "," +  (y+1)]);
					}

					if( this.isTile(x-1, y-1) ){ 
						count++;
						list.push(updated_index[(x-1) + "," +  (y-1)]);
					}
				}

				if( this.isTile(x, y+1) ){ 
					count++;
					list.push(updated_index[x + "," +  (y+1)]);
				}

				if( this.isTile(x, y-1) ){ 
					count++;
					list.push(updated_index[x + "," +  (y-1)]);
				}

				result['id'] = this.getLowestCost( list );
				result['count'] = count;

				return result;
			},
			getLowestCost: function( list ) {

				var initial = 0;
				var id = 0;

				$.each( list, function( index, value ) {
					this.g = this.g || false;

					if( this.g ) {
						if( initial == 0 ) initial = this.g;
						if( initial >= this.g ) {
							initial = this.g;
							id = this.id;
						}
					}
				});

				return id;
			},
			step: function( x1, y1, x2, y2, start_x, start_y, color, diagonals ) {

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
				
				options = this.checkStep( options, px, py, x2, y2, start_x, start_y );

				if( diagonals ) {
					py = y1 + 1;
					
					options = this.checkStep( options, px, py, x2, y2, start_x, start_y );

					py = y1 - 2;
					
					options = this.checkStep( options, px, py, x2, y2, start_x, start_y );
				}

				px = x1;
				py = y1;

				px = x1 - 1;
				
				options = this.checkStep( options, px, py, x2, y2, start_x, start_y );

				if( diagonals ) {
					py = y1 + 1;
					
					options = this.checkStep( options, px, py, x2, y2, start_x, start_y );

					py = y1 - 2;
					
					options = this.checkStep( options, px, py, x2, y2, start_x, start_y );
				}

				px = x1;
				py = y1;
				
				py = y1 + 1;
				
				options = this.checkStep( options, px, py, x2, y2, start_x, start_y );

				py = y1 - 1;
				
				options = this.checkStep( options, px, py, x2, y2, start_x, start_y );

				nearest = sortArrayDesc( options );

				result = options[ nearest[0] ] || false;

				return result;
			},
			checkStep: function( options, px, py, x2, y2, origin_x, origin_y ) {
				if( !this.isWall( px, py ) ) {
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
		};

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
						this.x1 -= 3;
						this.y1 -= 3;

						adjusted = true;
					}

					collision_count = 0;

					$.each(checker, function() {
						if( x2 == this.x2 && y2 == this.y2 ) collision_count++;
					});

					if( collision_count > 1 ) {
						this.x2 -= 3;
						this.y2 += 3;

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

			renderWalls( 'gold' );

			pathObj.resetWalls();
		}

		function renderWalls( color ) {

			for( var i in pathObj.walls )
				if( pathObj.walls[i].type == 1 ) 
					drawRect( pathObj.walls[i].x, pathObj.walls[i].y, 1, 1, color );
		
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
			
			update = pathObj.checkPossibleDirection( last_x, last_y, x2, y2-40 );
			makeWalls( update );

			return paths; 
		}

		function makeWalls( points ) {

			var inviswall = [];
			var path = 0;

			$.each( points, function(){

				pathObj.addWall( this.x, this.y );

				inviswall[ path ] = { x: this.x, y: this.y };

				path++;

			});

			var path = 0;
			var lx = 0;
			var ly = 0;
			var x = 0;
			var y = 0;
			var px = 0;
			var py = 0;

			for( var i in inviswall )
			{
				if( path >= 1 ) {
					lx = inviswall[ i - 1 ].x; x = inviswall[ i ].x;
					ly = inviswall[ i - 1 ].y; y = inviswall[ i ].y;
					
					px = x + 1; py = y;
					if( !pathObj.isWall( px, py ) ) pathObj.addWall( px, py, 2 );

					px = x - 1; py = y;
					if( !pathObj.isWall( px, py ) ) pathObj.addWall( px, py, 2 );

					px = x; py = y + 1;
					if( !pathObj.isWall( px, py ) ) pathObj.addWall( px, py, 2 );

					px = x; py = y - 1;
					if( !pathObj.isWall( px, py ) ) pathObj.addWall( px, py, 2 );

				}

				path++;
			}

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
			var inviswall = [];
			var path = 0;

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
					inviswall[ path ] = { x: x1, y: i };

					pathObj.addWall( x1, i );

					path++;
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
					inviswall[ path ] = { x: i, y: y1 };

					pathObj.addWall( i, y1 );

					path++;
				}
			
			} else {

				console.log( 'Line not given', x1, y1, x2, y2 );

				return false;
			}
				
			var path = 0;
			var lx = 0;
			var ly = 0;
			var x = 0;
			var y = 0;
			var px = 0;
			var py = 0;

			for( var i in inviswall )
			{
				if( path >= 1 ) {
					lx = inviswall[ i - 1 ].x; x = inviswall[ i ].x;
					ly = inviswall[ i - 1 ].y; y = inviswall[ i ].y;
					
					px = x + 1; py = y;
					if( !pathObj.isWall( px, py ) ) pathObj.addWall( px, py, 2 );

					px = x - 1; py = y;
					if( !pathObj.isWall( px, py ) ) pathObj.addWall( px, py, 2 );

					px = x; py = y + 1;
					if( !pathObj.isWall( px, py ) ) pathObj.addWall( px, py, 2 );

					px = x; py = y - 1;
					if( !pathObj.isWall( px, py ) ) pathObj.addWall( px, py, 2 );
				}

				path++;
			}

		}