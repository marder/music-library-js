(function (global) {

    var fs = require("fs-extra");
    var path = require("path");

    function WplPlugin() {
        return {
            async load( file ) {

                if ( /\.wpl$/.test( file ) === false ) return;

                return new Promise(function (resolve, reject) {

                    let songs = [];
                    
                    // ToDo parse wpl

                    resolve({
                        type: 'playlist',
                        name: path.basename(file),
                        songs: songs
                    });
                });

            }
        };
    }

    if (module) {
        module.exports = WplPlugin;
    } else {
        global.WplPlugin = WplPlugin
    }

})(this);