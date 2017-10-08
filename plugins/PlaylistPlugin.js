(function (global) {

    let fs = require("fs");
    let fsExtra = require("fs-extra");
    let path = require("path");
    let glob = require("glob");

    let FlacPlugin = require(`./FlacPlugin.js`);
    let Mp3Plugin = require(`./Mp3Plugin.js`);
    let OggPlugin = require(`./OggPlugin.js`);

    let plugins = [
        Mp3Plugin(),
        OggPlugin(),
        FlacPlugin()
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

                            // ToDo - parse result
                            // ToDo - use other plugins to check <media> files

                            let lines = content.split("\n");

                            for (let i=0; i<lines.length; i++) {

                                try {

                                    let line = lines[i].trim();

                                    if (line.charAt(0) === "#") {
                                        // Comment or command
                                        continue;
                                    }

                                    let innerFile = path.join(folder, line);

                                    if (innerFile && await fsExtra.exists(innerFile)) {
                                        for (let i = 0; i < plugins.length; i++) {
                                            let plugin = plugins[i];
                                            let result = await plugin.load(innerFile);
                                            if (result && typeof result.type === "string" && result.type === "song") {
                                                let song = createSong(innerFile, result.metadata);
                                                songs.push(song);
                                            }
                                        }
                                    }

                                } catch (err) {
                                    console.error(err);
                                }

                            }

                            resolve({
                                type: 'playlist',
                                name: path.basename(file),
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

    /**
     *
     * @param file
     * @param metadata
     * @returns {}
     */
    function createSong(file, relativeFile, metadata) {
        let song = {};

        song.file = song.url = file;

        song.artist = "Unknown artist";
        song.album = "Unknown album";
        song.title = "Unknown title";

        if (metadata) {

            if (metadata.artist.length > 0)
                song.artist = metadata.artist[0];

            song.album = metadata.album || song.album;
            song.title = metadata.title || song.title;

            if (metadata.picture.length > 0)
                song.image = metadata.picture[0];

        }

        return song;

    }

    if (module) {
        module.exports = PlaylistPlugin;
    } else {
        global.WplPlugin = PlaylistPlugin
    }

})(this);
