/*** -------------------------------------------------------------------------
 * Display Grid handler
 *
 * Author: jens@bennerhq.com, 2019
 */

/***
 * "THE BEER-WARE LICENSE" (Revision 43):
 * 
 * As long as you retain this notice you can do whatever you want with this 
 * stuff. If we meet some day, and you think this stuff is worth it, you can 
 * buy me a beer in return.
 * 
 * Thanks, 
 * Jens Kaas Benner
 * 
 * [https://en.wikipedia.org/wiki/Beerware]
 */

"use strict";

class Localization {

	constructor(url) {
		this.texts = resources.get("url_localization");
	}
	
	get(id) {
		return this.texts[id];
	}

	setObj(obj) {
		for (var id in obj) {
			var text = obj[id];
			if (text) {
				$("#" + id).html(text);
			}
		}
	}

	setID(id) {
		var obj = this.get(id);
		if (!obj) {
			return;
		}

		if (isString(obj)) {
			$("#" + id).html(obj);
		}
		else if (Array.isArray(obj)) {
			var idx = Math.floor(Math.random() * obj.length);
			this.setObj(obj[idx]);
		}
		else {
			this.setObj(obj);
		}
	}
};
