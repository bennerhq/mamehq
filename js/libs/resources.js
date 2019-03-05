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
        this.cache = {};
        this.urls = [];
    }

    moreUrls(urls) {
        if (Array.isArray(urls)) {
            this.urls = this.urls.concat(urls);
        }
        else if (isString(urls)) {
            this.urls.push({url: urls});
        }
        else if (urls.url) {
            this.urls.push(urls);
        }
        else {
            console.warn("ERROR: urls need to contain 'url'");
        }
    }

    moreJSON(config) {
        var replaceKey = (content) => {
            if (isString(content)) {
                for (var key in config) {
                    var str = config[key];
                    content = content.replace("{" + key + "}", str);
                }
            }

            return content;
        };

        for (var key in config) {
            var content = config[key];
            config[key] = replaceKey(content);
        }

        var urls = [];
        for (var key in config) {
            var url = config[key];

            if (key.startsWith("url_")) {
                urls.push({id: key, url: url});
            }
            else {
                this.set(key, null, url, null);
            }
        }

        this.moreUrls(urls);
    }

    set(id, url, data, callback) {
        this.cache[id] = {
            url: url,
            data: data,
            callback: callback
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

    loader(callback, injectJSON) {
        var self = this;

        var counter = this.urls.length;

        var finalize = () => {
            counter --;
            if (counter) {
                return;
            }

            var len = self.urls.length;
            for (var i=0; i < len; i++) {
                var item = self.urls[i];

                if (item.callback) {
                    item.callback(item.id, item.url, item.data);
                }
            }

            self.urls = [];

            var json = resources.get(injectJSON);
            if (json) {
                resources.moreJSON(json);
                self.loader(callback, false);
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

            var request = new XMLHttpRequest();
            request.open('GET', item.url, true);

            request.onerror = function() {
                console.warn("*** ERROR: Loading failed: " + item.url);

                finalize();
            };

            request.onload = function() {
                if (request.status < 200 && request.status >= 400) {
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
            
                    self.set(item.id || item.url, item.url, item.data, item.callback);
                }

                finalize();
            };

            request.send();
        }
 
        for (var i=0; i < this.urls.length; i++) {
            var item = this.urls[i];
            getDataByURL(item);
        }
    }
}
