		// Calculating functions
		function overlap(r1, r2) {
		    var hit = !(r1.x + r1.w < r2.x ||
		               r2.x + r2.w < r1.x ||
		               r1.y + r1.h < r2.y ||
		               r2.y + r2.h < r1.y);
	    	
	    	return hit;
		}

		function limVar( num, min, max ) {
			return Math.min( Math.max( parseFloat( num ), min ), max );
		}

		function randNum( min, max ) {
			return Math.floor( Math.random() * (max - min + 1) + min );
		}

		function drawEllipse( centerX, centerY, width, height ) 
		{
			context.beginPath();
			context.moveTo(centerX, centerY - height/2);

			context.bezierCurveTo(
			centerX + width/2, centerY - height/2,
			centerX + width/2, centerY + height/2,
			centerX, centerY + height/2);

			context.bezierCurveTo(
			centerX - width/2, centerY + height/2,
			centerX - width/2, centerY - height/2,
			centerX, centerY - height/2);

			context.fillStyle = 'rgba(0,0,0,0.4)';
			context.fill();
			context.closePath();	
		}

		function scaleImage( ) {
			context.scale( scalewidth, scaleheight);
		}

		function revertScale( ) {
			context.scale( revertwidth, revertheight);
		}

		function calculateFPS() {

			var thisFrameFPS = 1000 / ((now=new Date) - lastUpdate);
			
			if (now!=lastUpdate){
				fps += (thisFrameFPS - fps) / fpsFilter;
				lastUpdate = now;
			}

		}

		function drawFromPartImage( image, map, x, y, w, h ) {

			if(typeof(w)==='undefined') w = map.w;
			if(typeof(h)==='undefined') h = map.h;

			context.drawImage( image, 
				map.x, map.y, map.w, map.h,
				x, y, w, h
			);
		
		}

		function addText( text, x, y, size, color, opacity ) {

			if(typeof(size)==='undefined') size = 24;	
			if(typeof(color)==='undefined') color = "White";	
			if(typeof(opacity)==='undefined') opacity = 1;	

			context.save();

			opacity = limVar(opacity, 0, 1);
			
			context.globalAlpha = opacity;
			context.font = size + "px Gloria Hallelujah";
			context.fillStyle = color;
			context.miterLimit = 2;
			context.lineJoin = 'circle';
			context.lineWidth = 7;
			context.strokeText(text, x, y);
			context.lineWidth = 1;
			context.fillText(text, x, y);      
			context.globalAlpha = 1;
			context.restore();
		}

		function drawLine( fx, fy, tx, ty, w, h, color ) {

			if(typeof(color)==='undefined') color = "rgba(40,206,199,0.8)";
			
			context.save();
			context.strokeStyle = color;
			context.beginPath();
			context.moveTo(fx,fy);
			context.lineTo(tx,ty);
			context.stroke();
			context.restore();

		}

		function drawRect( x, y, w, h, color ) {

			if(typeof(color)==='undefined') color = "rgba(40,206,199,0.8)";

			context.save();
			context.fillStyle = color;
			context.fillRect(x,y,w,h);
			context.restore();
		}

		function drawBorder( x, y, w, h, color ) {

			if(typeof(color)==='undefined') color = "rgba(40,206,199,0.8)";

			context.save();
			context.strokeStyle = color;
			context.rect( x, y, w, h );
			context.stroke();
			context.restore();

		}

		function drawMouse( x, y, id ) {

			if(typeof(id)==='undefined') id = "canvas";

			var div = $("#" + id);
		    var width = 721;
			var height = 770;
			var ratiox = width / div.width();
			var ratioy = height / div.height();
		    var mousex = (x - div.offset().left) * ratiox;
		    var mousey = (y - div.offset().top) * ratioy;
		    var canvas = document.getElementById( id );
			var context = mainMenucanvas.getContext("2d");

			if(typeof(cursor)==='object') context.drawImage( cursor, mousex - 15, mousey - 5 );
			else drawRect( mousex-2.5, mousey-2.5, 5, 5, id );

	    	addText( Math.round(mousex) + ', ' + Math.round(mousey), mousex+25, mousey+70 );

	    	return { x: mousex, y: mousey };

		}

		function timeStamp() {
			if (!Date.now) {
			    Date.now = function() { 
			    	return new Date().getTime(); 
			    };
			}

			return Date.now();
		}

		function preventDefault(e) {
			e = e || window.event;

			if (e.preventDefault) e.preventDefault();

			e.returnValue = false;  
		}

		function displayCascadingText( text, length, x, y, text_size, color ) {
			
			var addMore = false;

			if( text.length > length ) addMore = true;

			addText( text.substr( 0, length ), x, y, text_size, color );

			if( addMore ) {
				y += 12;
				displayCascadingText( text.substr( length, ( text.length - length ) ), length, x, y, text_size, color );
			}
		}

		function getDistance( point1, point2 )
		{
			var xs = 0;
			var ys = 0;

			xs = point2.x - point1.x;
			xs = xs * xs;

			ys = point2.y - point1.y;
			ys = ys * ys;

			return Math.sqrt( xs + ys );
		}