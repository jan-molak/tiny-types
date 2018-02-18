const path = require("path");
const cheerio = require("cheerio");

const toSnippet = id => `<meta name="google-site-verification" content="${id}" />`;

class Plugin {
    onStart(ev) {
        this._option = ev.data.option || {};
        if (!("enable" in this._option)) this._option.enable = true;
    }

    onHandleContent(ev) {
        if (!this._option.enable) return;

        const fileName = ev.data.fileName;
        if (path.extname(fileName) !== ".html") return;

        const $ = cheerio.load(ev.data.content);

        $("head").append(toSnippet(this._option.id));

        ev.data.content = $.html();
    }
}

module.exports = new Plugin();
