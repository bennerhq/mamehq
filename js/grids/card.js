/*** -------------------------------------------------------------------------
 * Main application entry point
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

class Card {

	constructor(game) {
		for (var attr in game) {
			if (game.hasOwnProperty(attr)) {
				this[attr] = game[attr];
			}
		}

		this.sorted = "";
		if (this.description) {
			this.sorted = this.description.toUpperCase().replace(/[^a-zA-Z0-9 ]/g, "");
		}
	}

	showHTML(on, focus) {
		var html = "";

		const img = new Image();
		img.src = resources.get("snap", {"{name}": this.name});
		let snap = img.src;
		if (!img.complete) {
			snap = resources.get("url_image_arcade_icon");

			img.onload = function() {
				var $image = $("#" + card_image_id);
				$image.css({
					"background-image": "url(" + this.src + ")"
				});
			};
		}

		var card_image_id = "card-image-id-" + this.name;
		var description = this.description || "-";
		var year = this.year || "-";
		var manufacturer = this.manufacturer || "-";

		html +=
			"<div class='card-image' id='" + card_image_id + "' style='background-image:url(" + snap + ")'></div>" +
			"<div class='card-info'>" +
				"<div class='card-description'>" + description + "</div>" +
				"<div class='card-year'>" + year + "</div>" +
				"<div class='card-manufacturer'>" + manufacturer + "</div>" +
			"</div>";

		if (this.counter || this.favorit || this.bad || this.notWorking) {
			html += "<div class='card-special'>";

			if (this.counter) {
				var today = new Date();
				var diff = today - this.last;
				var elapsed = elapsedString(diff);

				var icon = resources.button({id: "last", on: on, focus: focus, height: 14});
				html += "<div class='card-special-item'>"  + icon + elapsed + "</div>";

				var icon = resources.button({id: "most", on: on, focus: focus, height: 14});
				html += "<div class='card-special-item'>" + icon + this.counter + "</div>";
			}

			if (this.favorit) {
				var icon = resources.button({id: "favorits", on: on, focus: focus, height: 14});

				html += "<div class='card-special-item'>" + icon + "</div>";
			}

			if (this.bad) {
				var icon = resources.button({id: "bad", on: on, focus: focus, height: 14});

				html += "<div class='card-special-item'>" + icon + "</div>";
			}
/*
			if (this.notWorking) {
				html += "<div class='card-special-item'>?</div>";
			}
*/
			html += "</div>";
		}

		return html;
	}

	static cmpSortedInc(a, b) {
		if (a.sorted < b.sorted) {
			return -1;
		}
	
		if (a.sorted > b.sorted) {
			return 1;
		}
	
		return 0;
	}

	static cmpSortedDec(a, b) {
		return Card.cmpSortedInc(b, a);
	}

	static cmpMostInc(a, b) {
		var cmp = b.counter - a.counter;
		if (cmp === 0) {
			cmp = Card.cmpSortedInc(a, b);
		}
		return cmp;
	}

	static cmpMostDec(a, b) {
		return Card.cmpMostInc(b, a);
	}

	static cmpLastInc(a, b) {
		var cmp = b.last - a.last;
		if (cmp === 0) {
			cmp = Card.cmpSortedInc(a, b);
		}
		return cmp;
	}

	static cmpLastDec(a, b) {
		return Card.cmpLastInc(b, a);
	}

	static cmpFirst(a, b) {
		var cmp = a.first - b.first;
		if (cmp === 0) {
			cmp = Card.cmpSortedInc(a, b);
		}
		return cmp;
	}

	static cmpFavorit(a, b) {
		var cmp = b.favorit - a.favorit;
		if (cmp === 0) {
			cmp = Card.cmpSortedInc(a, b);
		}
		return cmp;
	}
}
