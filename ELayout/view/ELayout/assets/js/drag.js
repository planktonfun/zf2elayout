		var canvasPos = {
			x: 0,
			y: 0,
			limit_min_x: -300,
			limit_min_y: -150,
			limit_max_x: 700,
			limit_max_y: 650,
			updateOffset: function( obj ) {
				this.x += obj.offset_x;
		        this.y += obj.offset_y;
			}
		};

		var dragObj = {
			dragging: false,
			start_x: 0,
			start_y: 0,
			offset_x: 0,
			offset_y: 0,
			setStart: function ( e ) {
				this.start_x = e.clientX || e.layerX; 
				this.start_y = e.clientY || e.layerY;
			},
			updateCanvas: function( e, canvasPos ) {
				
				this.offset_x = this.start_x - ( e.clientX || e.layerX );
				this.offset_y = this.start_y - ( e.clientY || e.layerY );

		        canvasPos.updateOffset( this );
		        
		        this.setStart( e );
			}
		};
		
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