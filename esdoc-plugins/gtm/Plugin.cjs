const path = require("path");
const cheerio = require("cheerio");

const toSnippet = id => `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');</script>`;

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

    onPublish(ev) {
        if (!this._option.enable) return;
        ev.data.writeFile("gtm.js", toSnippet(this._option.id));
    }
}

module.exports = new Plugin();
