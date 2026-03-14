class Plugin {
    onStart(ev) {
        this._option = ev.data.option || {};
        if (!("enable" in this._option)) this._option.enable = true;
    }

    onPublish(ev) {
        if (!this._option.enable) return;
        ev.data.writeFile(".nojekyll", '');
    }
}

module.exports = new Plugin();
