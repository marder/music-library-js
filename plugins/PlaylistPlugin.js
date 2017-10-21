(function (global) {

    let fs = require("fs");
    let fsExtra = require("fs-extra");
    let path = require("path");
    let glob = require("glob");

    let MusicFilePlugin = require(`./MusicFilePlugin.js`);

    let plugins = [
        MusicFilePlugin()
    ];

    function PlaylistPlugin() {
        return {
            async load( file ) {

                if ( /\.playlist$/.test( file ) === false ) return;

                return new Promise(function (resolve, reject) {

                    console.log("Testing playlist " + path.basename(file));

                    let folder = path.dirname(file);

                    fs.readFile(file, "utf8", async function (err, content) {

                        if (err) {
                            reject(err);
                        } else {

                            let songs = [];
                            let name = path.basename(file);
                            let lines = content.split("\n");

                            // Trim extension
                            name = name.replace(/\.[^/.]+$/, "");

                            for (let i=0; i<lines.length; i++) {

                                try {

                                    let line = lines[i].trim();

                                    if (line.length === 0) {
                                        continue;
                                    }

                                    if (line.charAt(0) === "#") {

                                        // Comment or command
                                        if (line.toLowerCase().startsWith("#name")) {
                                            name = line.substring(6);
                                        }

                                        continue;
                                    }

                                    let innerFile = path.join(folder, line);

                                    if (innerFile && await fsExtra.exists(innerFile)) {
                                        for (let i = 0; i < plugins.length; i++) {
                                            let plugin = plugins[i];
                                            let result = await plugin.load(innerFile);
                                            if (result && typeof result.type === "string" && result.type === "song") {
                                                songs.push({
                                                    file: innerFile, 
                                                    metadata: result.metadata
                                                });
                                                break;
                                            }
                                        }
                                    }

                                } catch (err) {
                                    console.error(err);
                                }

                            }

                            resolve({
                                type: 'playlist',
                                name: name,
                                songs: songs
                            });

                        }

                    });
                });

            },
            async find( folder ) {
                return new Promise(function (resolve, reject) {
                    glob(folder + "/**/*.playlist", function (err, files) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(files);
                        }
                    });
                });
            }
        };
    }

    if (module) {
        module.exports = PlaylistPlugin;
    } else {
        global.PlaylistPlugin = PlaylistPlugin
    }

})(this);
