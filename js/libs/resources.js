/*** -------------------------------------------------------------------------
 * Resource Load Handeling
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

class Resources {

	constructor() {
		this.urls = [];
		this.cache = {};
	}

	moreUrls(urls) {
		if (!Array.isArray(urls)) {
			urls = [urls];
		}

		var added = false;

		urls.forEach((item) => {
			if (item.url) {
				this.urls.push(item);
				added = true;
			}
			else if (isString(item)) {
				this.urls.push({url: item});
				added = true;
			}
			else {
				console.warn("ERROR: url items need to contain '.url' or be a 'string'");
			}
		});

		return added;
	}

	moreJSON(json) {
		if (!json) {
			return;
		}

		var replaceKey = (content) => {
			for (var key in json) {
				var str = json[key];
				if (isString(str)) {
					content = content.replace("{" + key + "}", str);
				}
			}

			return content;
		};

		for (var key in json) {
			var content = json[key];
			if (isString(content)) {
				json[key] = replaceKey(content);
			}
		}

		var added = false;

		for (var key in json) {
			var url = json[key];

			if (key.startsWith("url_")) {
				this.urls.push({id: key, url: url});

				added = true;
			}
			else {
				this.set(key, null, url);
			}
		}

		return added;
	}

	set(id, url, data) {
		if (!id) {
			id = url;
		}

		this.cache[id] = {
			url: url,
			data: data
		};
	}

	get(id, params) {
		var item = this.cache[id];
		if (!item) {
			return null;
		}

		var res = item.data;

		if (params) {
			for (var key in params) {
				var value = params[key];
				res = res.replace(key, value);
			}
		}

		return res;
	}

	loader(callback) {
		var self = this;

		var counter = this.urls.length;

		var finalize = () => {
			counter --;
			if (counter) {
				return;
			}

			var merged = {};
			self.urls.forEach((item) => {
				if (typeof item.data === "object") {
					merged = Object.assign(merged, item.data);
				}
			});

			self.urls = [];

			var added = self.moreJSON(merged);
			if (added) {
				self.loader(callback);
			}
			else {
				callback();
			}
		}

		var getDataByURL = (item) => {
			if (!item.url) {
				finalize();
				return;
			}

			for (var key in self.cache) {
				var str = self.cache[key].data;
				if (isString(str)) {
					item.url = item.url.replace("{" + key + "}", str);
				}
			}

			var request = new XMLHttpRequest();
			request.open('GET', item.url, true);

			request.onerror = function() {
				console.warn("*** ERROR: Loading failed: " + item.url);

				finalize();
			};

			request.onload = function() {
				if (request.status < 200 || request.status >= 400) {
					console.warn("*** ERROR: Status code: " + request.status);
				}
				else {
					item.data = request.responseText;

					if (item.url.endsWith(".json")) {
						item.data = JSON.parse(item.data);
					}
					else if (item.url.endsWith(".svg")) {
						var base64 = window.btoa(item.data);
						item.data = "data:image/svg+xml;base64," + base64;
					}

					self.set(item.id, item.url, item.data);
				}

				finalize();
			};

			request.send();
		}
 
		this.urls.forEach((item) => {
			getDataByURL(item);
		});
	}

	button(config) {
		if (!config || !config.id) {
			return "<ERROR>";
		}
		var str = "";

		let type;
		if (config.on) {
			if (config.focus) {
				type = "focus";
			}
			else {
				type = "on";
			}
		}
		else {
			type = "off";
		}

		var id = "url_" + config.id + "_" + type;
		var image = this.get(id);
		if (image) {
			str = "<img src='" + image + "'";

			if (config.width) {
				str += " width=" + config.width + "px";
			}
			if (config.height) {
				str += " height=" + config.height + "px";
			}

			str += ">";
		}

		return str;
	}
}
