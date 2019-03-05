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

class Config {

    constructor() {
        var config = resources.get("config");

        var replace = (content) => {
            if (isString(content)) {
                for (var key in config) {
                    var str = config[key];
                    content = content.replace("{" + key + "}", str);
                }
            }
            return content;
        };

        for (var key in config) {
            var content = this.config[key];
            config[key] = replace(content);
        }

        var urls = [];
        for (var key in config) {
            if (key.startsWith("url_")) {
                var url = config[key];
                urls.push({
                    id: key,
                    url: url
                });
            }
        }

        resources.moreUrls(urls);
    }
}
