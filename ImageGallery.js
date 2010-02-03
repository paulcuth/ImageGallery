


function ImageGallery (element, images, options) {
	
	if (!options) options = {};
	
	if (typeof element == 'string') element = glow.dom.get ('#' + element)[0];
	if (!element || element.nodeType != 1) throw new Error ('ImageGallery requires valid element.');

	if (!(this._images = images)) throw new Error ('ImageGallery requires image array.');


	while (el = element.childNodes[0]) element.removeChild (el);

	var el = this._element = glow.dom.get (element).addClass ('image-gallery');
		thumbnail_size = options.thumbnail_size || 100;
	

	// Image
	this._image_wrap = glow.dom.create ('<div class="wrapper image"></div>').appendTo (el);

	// Caption
	this._caption_wrap = glow.dom.create ('<div class="wrapper caption"><div class="background"></div></div>').appendTo (el);
	this._caption = glow.dom.create ('<p></p>').appendTo (this._caption_wrap);
	
	// Image list
	this._image_list_wrap = glow.dom.create ('<div class="wrapper image-list"><div class="background"></div></div>').appendTo (el);
	this._image_list = glow.dom.create ('<ul></ul>').appendTo (this._image_list_wrap);

	// Clear
	el.append (glow.dom.create ('<div class="clear"></div>'));


	var ig = this,
		auto_height = 0,
		auto_width = 0;
	
	for (var i in this._images) {

		var obj = this._images[i],
			li = glow.dom.create ('<li></li>');
			
		var img = glow.dom.create ('<img />').
						attr ('src', obj.filename).
						attr ('alt', obj.caption);

		glow.events.addListener (img, 'click', (function () {
			var j = i;
			return function () { ig._handle_tn_click (j); };
		})());

		if (obj.height > auto_height) auto_height = obj.height;
		if (obj.width > auto_width) auto_width = obj.width;

		if (obj.height > obj.width) {
			img.css ('height', thumbnail_size + 'px');
			img.css ('width', thumbnail_size * obj.width / obj.height + 'px');
		} else {
			img.css ('width', thumbnail_size + 'px');
			img.css ('height', thumbnail_size * obj.height / obj.width + 'px');
		}
	
		obj.list_element = li;

		li.append (img);
		this._image_list.append (li);
	}
	
	el.height (options.height || auto_height).width (options.width || auto_width);
	
	this._caption_wrap.css ('visibility', 'hidden');
	this._image_list_wrap.css ('bottom', -this._image_list_wrap.height () + 'px');
	
	glow.events.addListener (el, 'mouseenter', function () {
		if (ig._loaded) glow.anim.css (ig._image_list_wrap, 0.2, { bottom: { to: 0 } }, { tween: glow.tweens.easeOut () }).start ();
	});
	
	glow.events.addListener (el, 'mouseleave', function () {
		glow.anim.css (ig._image_list_wrap, 0.2, { bottom: { to: -ig._image_list_wrap.height () } }, { tween: glow.tweens.easeOut () }).start ();
	});


	this.show (0);
}



ImageGallery.prototype._handle_tn_click = function (index) {

	this.stop_slideshow ();
	this.show (index);
};



ImageGallery.prototype._set_timeout = function () {

	if (this._slide_duration && !this._timeout) {
		var ig = this;
		
		this._timeout = window.setTimeout (function () {
			ig._timeout = undefined;
			ig.show ((ig._current_index + 1) % ig._images.length);
		}, this._slide_duration);
	}
}



ImageGallery.prototype.show = function (index) {

	if (index != this._current_index) {
		var ig = this;
			
		var load_image = function () {
	
			var on_img_solid = function () {
				if (old_image) {
					glow.anim.fadeOut (old_image, 0.5, { tween: glow.tweens.easeOut (), onComplete: function () { old_image.remove (); } });
				}

				ig._loaded = true;
				ig._set_timeout ();
			};
			
			var on_img_loaded = function () {
				ig._caption.html (ig._images[ig._current_index].caption);
				ig._caption_wrap.css ('top', -ig._caption_wrap.height ()).css ('visibility', 'visible');
				
				if (old_index != undefined) ig._images[old_index].list_element.removeClass ('selected');
				ig._images[index].list_element.addClass ('selected');

				glow.anim.css (ig._caption_wrap, 0.5, { top: { to: 0 } }, { tween: glow.tweens.easeOut () }).start ();
				glow.anim.fadeIn (ig._current_image, 0.5, { tween: glow.tweens.easeOut (), onComplete: on_img_solid });
				
				var mid = (ig._element.width () / 2) + ig._element.offset ().left,
					offset = (parseInt (ig._image_list.css ('left')) || 0) - (ig._images[index].list_element.offset ().left - mid) - (ig._images[index].list_element.width () / 2);

				glow.anim.css (ig._image_list, 0.5, { left: { to: offset } }, { tween: glow.tweens.easeOut () }).start ();
			};
		

			var old_image = ig._current_image,
				old_index = ig._current_index,
				img = ig._images[index];
				
			ig._current_index = index;
			ig._current_image = glow.dom.create ('<img />').
									css ({ opacity: 0, top: (ig._element.height () - img.height) / 2 + 'px', left: (ig._element.width () - img.width) / 2 + 'px' }).
									attr ('alt', img.caption).
									appendTo (ig._image_wrap);
			
			glow.events.addListener (ig._current_image, 'load', on_img_loaded);
			ig._current_image.attr ('src', img.filename);
		};
		
		
		if (this._current_index != undefined) {		
			glow.anim.css (ig._caption_wrap, 0.5, { top: { to: -ig._caption_wrap.height () } }, { tween: glow.tweens.easeOut (), onComplete: load_image }).start ();

		} else {
			load_image ();
		}
	}
};



ImageGallery.prototype.start_slideshow = function (duration) {
	
	this._slide_duration = (duration || 5) * 1000;
	if (this._loaded) this._set_timeout ();
};



ImageGallery.prototype.stop_slideshow = function () {
	
	var t;
	if (t = this._timeout) window.clearTimeout (t);

	this._slide_duration = this._timeout = undefined;
};



