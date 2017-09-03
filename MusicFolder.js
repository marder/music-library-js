(function (global) {

    var fs = require("fs-extra");
    var path = require("path");

    var FlacPlugin = require(`${__dirname}/plugins/FlacPlugin.js`);
    var Mp3Plugin = require(`${__dirname}/plugins/Mp3Plugin.js`);
    var OggPlugin = require(`${__dirname}/plugins/OggPlugin.js`);
    var WplPlugin = require(`${__dirname}/plugins/WplPlugin.js`);

    /**
     * 
     */
    class MusicFolder {

        static get MinRequiredVersion() {
            return "0.1";
        }

        // Method that returns the path for cache file in current music folder
        get cacheFile() {
            return path.join(this.path, ".electron-music")
        }

        /**
         * 
         * @param {string} path 
         */
        constructor(path) {
            this.path = path;
            this.caching = true;
            this.songs = [];
            this.playlists = {};
            this.plugins = [
                WplPlugin(),
                Mp3Plugin(),
                OggPlugin(),
                FlacPlugin()
            ];
        }

        /**
         * 
         */
        async preload() {

            if (await fs.exists(this.path) === false) {
                throw new Error(`Folder "${this.path}" not found.`);
            }

            if (await fs.exists(this.cacheFile)) {

                // Import songs from cache file within folder
                await this.loadCacheFile();

            } else {

                // No cache file found
                // We have to scan the folder and create a cache file if (this.caching)
                await this.scanFolder();

            }

        }

        /**
         * 
         */
        async scanFolder() {

            let self = this;

            return new Promise(function (resolve, reject) {

                let walker = walk.walk(self.path);

                walker.on("file", function (root, stats, next) {

                    let file = path.join(root, stats.name);
                    self.scanFile(file).then(next);

                });

                walker.on("end", function () {
                    self.saveCacheFile();
                    resolve();
                });

            });
        }
        /**
         * 
         * @param {string} file 
         */
        async scanFile(file) {

            let self = this;

            // Abort if file does not exist
            if (await fs.exists(file) === false) {
                return false;
            }


            for (let i = 0; i < this.plugins.length; i++) {

                let plugin = this.plugins[i];

                let result = await plugin.load(file);

                if (result && typeof result.type === "string") {

                    switch (result.type.toLowerCase()) {

                        case "error":
                            console.error(result.error);
                            break;

                        case "song":

                            let song = createSong(file, result.metadata);
                            this.songs.push(song);

                            break;

                        case "playlist":

                            let songs = [];

                            result.songs.forEach(s => {
                                songs.push(createSong(s.file, s.metadata));
                            });

                            this.playlist[result.name] = {
                                name: result.name,
                                songs: songs,
                                file: file
                            }

                            break;

                    }

                }

            }

            function createSong(file, metadata) {
                let song = {};

                song.file = song.url = file;
                song.relativePath = path.relative(self.path, file);

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
        }

        /**
         * 
         */
        async loadCacheFile() {

            let self = this;
            let cacheFile = this.cacheFile;

            if (await fs.exists(cacheFile) === false) {
                return;
            }

            // Read and parse /.electron-music file

            let text = await fs.readFile(cacheFile, "utf8");
            let lines = text.split("\n");

            let files = [];

            for (let i = 0; i < lines.length; i++) {

                // Cut space before and after line content
                let line = lines[i].trim();

                if (line.length == 0)
                    // Line is empty. Go to next line
                    continue;

                if (line[0] == '#') {
                    // Line is comment
                    // Check comment content
                    if (line.length > 1) {
                        // Comment with information
                        line = line.substring(1).split(" ");
                        switch (line[1].toLowerCase()) {
                            // Nothing yet
                        }
                    }

                    // Just go to next line
                    continue;
                }

                files.push(line);

            }

            // Check all found files

            if (files && files.length) {

                for (let i = 0; i < files.length; i++) {

                    let file = path.join(this.path, files[i]);

                    if (await fs.exists(file)) {
                        await this.scanFile(file);
                    }

                }

            }

        }
        /**
         * 
         */
        async saveCacheFile() {

            if (!this.caching) {
                return;
            }

            let self = this;

            if (await fs.exists(this.cacheFile)) {
                await fs.unlink(this.cacheFile);
            }

            let writeStream = null;

            try {

                writeStream = fs.createWriteStream(this.cacheFile);

                writeStream.write("# version " + config.version);

                for (let i = 0; i < this.songs.length; i++) {
                    writeStream.write(this.songs[i].relativePath + "\n");
                }

            } catch (ex) {
                console.error(ex);
            }

        }

    }

    if (module) {
        module.exports = MusicFolder;
    } else {
        global.MusicFolder = MusicFolder;
    }

})(this);