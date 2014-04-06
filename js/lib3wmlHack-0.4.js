/**
 * @preserve LICENSE:
 * Lib3wmlHack is licensed under Creative Commons Attribution-NonCommercial-NoDerivs 3.0 Unported License.
 * Permissions beyond the scope of this license may be available at http://www.hecube.net/
 * codeAuthor: info@3wdoc.com
 */

// CSS3 fontface init
(function( $ ){
	$(document).ready(function () {
		if( $.get3wmlBrowserCompliance() === false ) {
			return false;
		}
		var fontface = $.setFontface();
		fontface.init();
	});
}(jQuery));

// event.layer(X|Y) messages shutdown
(function( $ ){
	// remove layerX and layerY
	var all = $.event.props, len = all.length, res = [];
	while(len--) {
		var el = all[len];
		if( el != 'layerX' && el != 'layerY' ) {
			res.push(el);
		}
	}
	$.event.props = res;
}(jQuery));

// http://bugs.jqueryui.com/ticket/4186
(function( $ ) {
	var oldSetOption = $.ui.resizable.prototype._setOption;
	$.ui.resizable.prototype._setOption = function(key, value) {
		oldSetOption.apply(this, arguments);
		if (key === "aspectRatio") {
			this._aspectRatio = !!value;
		}
	};
})(jQuery);

// z-index problem correction
(function( $ ) {
	$.effects.explode = function(o) {
		return this.queue(function() {
			var rows = o.options.pieces ? Math.round(Math.sqrt(o.options.pieces)) : 3;
			var cells = o.options.pieces ? Math.round(Math.sqrt(o.options.pieces)) : 3;
			o.options.mode = o.options.mode == 'toggle' ? ($(this).is(':visible') ? 'hide' : 'show') : o.options.mode;
			var el = $(this).show().css('visibility', 'hidden');
			var offset = el.offset();
			//Substract the margins - not fixing the problem yet.
			offset.top -= parseInt(el.css("marginTop"),10) || 0;
			offset.left -= parseInt(el.css("marginLeft"),10) || 0;
			var width = el.outerWidth(true);
			var height = el.outerHeight(true);
			var zIndex = o.options.zIndex ? parseInt(o.options.zIndex) : "auto";
			for( var i = 0; i < rows; i++ ) { // =
				for( var j = 0; j < cells; j++ ) { // ||
					el
						.clone()
						.appendTo('body')
						.wrap('<div></div>')
						.css({
							"position": 'absolute',
							"visibility": 'visible',
							"z-index": zIndex,
							"left": -j*(width/cells),
							"top": -i*(height/rows)
						})
						.parent()
						.addClass('ui-effects-explode')
						.css({
							"position": 'absolute',
							"overflow": 'hidden',
							"z-index": zIndex,
							"width": width/cells,
							"height": height/rows,
							"left": offset.left + j*(width/cells) + (o.options.mode == 'show' ? (j-Math.floor(cells/2))*(width/cells) : 0),
							"top": offset.top + i*(height/rows) + (o.options.mode == 'show' ? (i-Math.floor(rows/2))*(height/rows) : 0),
							"opacity": o.options.mode == 'show' ? 0 : 1
						}).animate({
							"left": offset.left + j*(width/cells) + (o.options.mode == 'show' ? 0 : (j-Math.floor(cells/2))*(width/cells)),
							"top": offset.top + i*(height/rows) + (o.options.mode == 'show' ? 0 : (i-Math.floor(rows/2))*(height/rows)),
							"opacity": o.options.mode == 'show' ? 1 : 0
						}, o.duration || 500);
				}
			}
			// Set a timeout, to call the callback approx. when the other animations have finished
			setTimeout(function() {
				o.options.mode == 'show' ? el.css({ visibility: 'visible' }) : el.css({ visibility: 'visible' }).hide();
						if(o.callback) o.callback.apply(el[0]); // Callback
						el.dequeue();
						$('div.ui-effects-explode').remove();
			}, o.duration || 500);
		});
	};
})(jQuery);
