(function (global) {

    let fs = require("fs-extra");
    let path = require("path");
    let walk = require("walk");

    let FlacPlugin = require(`./plugins/FlacPlugin.js`);
    let Mp3Plugin = require(`./plugins/Mp3Plugin.js`);
    let OggPlugin = require(`./plugins/OggPlugin.js`);
    let WplPlugin = require(`./plugins/WplPlugin.js`);
    let PlaylistPlugin = require("./plugins/PlaylistPlugin");

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
                Mp3Plugin(),
                OggPlugin(),
                FlacPlugin()
            ];
        }

        /**
         *
         */
        async preload() {

            try {

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

                await this.loadPlaylists();

            } catch (err) {
                console.log(err);
            }

        }

        /**
         *
         */
        async scanFolder() {

            let self = this;

            return new Promise(function (resolve, reject) {

                try {

                    let walker = walk.walk(self.path);

                    walker.on("file", function (root, stats, next) {
                        let file = path.join(root, stats.name);
                        self.scanFile(file).then(next).catch(console.error);
                    });

                    walker.on("end", function () {
                        self.saveCacheFile().catch(console.error);
                        resolve();
                    });

                } catch (err) {
                    reject(err);
                }

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

                            let song = self.createSong(file, result.metadata);
                            this.songs.push(song);

                            break;

                        case "playlist":

                            let songs = [];

                            result.songs.forEach(s => {
                                songs.push(self.createSong(s.file, s.metadata));
                            });

                            this.playlists[result.name] = {
                                name: result.name,
                                songs: songs,
                                file: file
                            };

                            break;

                    }

                }

            }

        }

        async loadPlaylists() {

            try {

                let plugin = PlaylistPlugin();
                let files = await plugin.find(this.path);

                for (let i = 0; i < files.length; i++) {

                    let file = files[i];
                    let result = await plugin.load(file);

                    if (result && typeof result.type === "string") {

                        switch (result.type.toLowerCase()) {

                            case "error":
                                console.error(result.error);
                                break;

                            case "playlist":

                                let songs = [];

                                result.songs.forEach(s => {
                                    songs.push(this.createSong(s.file, s.metadata));
                                });

                                this.playlists[result.name] = {
                                    name: result.name,
                                    songs: songs,
                                    file: file
                                };

                                break;

                        }

                    }
                }

            } catch (err) {
                console.log(err);
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

                for (let i = 0; i < this.songs.length; i++) {
                    var song = this.songs[i];
                    var relative = path.relative(this.path, song.file);
                    writeStream.write(relative + "\n");
                }

            } catch (ex) {
                console.error(ex);
            }

        }

        createSong(file, metadata) {
            let song = {};

            song.file = song.url = file;

            song.number = 0;
            song.artist = "Unknown artist";
            song.album = "Unknown album";
            song.title = "Unknown title";

            if (metadata) {

                if (metadata.artist.length > 0)
                    song.artist = metadata.artist[0];

                song.album = metadata.album || song.album;
                song.title = metadata.title || song.title;

                if ("number" in metadata) {
                    song.number = metadata.number;
                }

                if (metadata.picture.length > 0)
                    song.image = metadata.picture[0];

            }

            return song;

        }

    }

    if (module) {
        module.exports = MusicFolder;
    } else {
        global.MusicFolder = MusicFolder;
    }

})(this);
