(function (global) {

    let fs = require("fs-extra");
    let path = require("path");
    let walk = require("walk");
    let uuid = require("uuid");

    let FlacPlugin = require(`./plugins/FlacPlugin.js`);
    let Mp3Plugin = require(`./plugins/Mp3Plugin.js`);
    let OggPlugin = require(`./plugins/OggPlugin.js`);
    let WplPlugin = require(`./plugins/WplPlugin.js`);
    let PlaylistPlugin = require("./plugins/PlaylistPlugin");

    let AudioFilePlugins = [
        FlacPlugin(),
        Mp3Plugin(),
        OggPlugin()
    ];

    let PlaylistPlugins = [
        PlaylistPlugin()
    ];

    class MusicFolder {

        get cacheFile() {
            return path.join(this.folder, "marder-music-cache.json");
        }

        constructor(folder) {

            this.folder = folder;

            this.songs = [];
            this.playlists = {};

        }

        async load() {
            if (await fs.exists(this.cacheFile)) {
                this.loadCacheFile();
            } else {
                await this.scan();
            }
        }

        loadCacheFile() {

            let cache = require(this.cacheFile);

            this.songs = cache.songs;
            this.playlists = cache.playlists;

            for (let i = 0; i < this.songs.length; i++) {
                let song = this.songs[i];
                song.file = path.join(this.folder, song.file);
            }

        }
        async saveCacheFile() {

            let cache = {
                songs: this.songs,
                playlists: this.playlists
            };

            await fs.writeFile(this.cacheFile, JSON.stringify(cache), "utf8");

        }

        async scan() {

            for (let i = 0; i < AudioFilePlugins.length; i++) {
                let plugin = AudioFilePlugins[i];
                let files = await plugin.find(this.folder);
                for (let j = 0; j < files.length; j++) {
                    let data = await plugin.load(files[j]);
                    if (data) {
                        this.addSong(data.file, data.metadata);
                    }
                }
            }

            // Playlists must be loaded after songs
            // They need them to be ready
            for (let i = 0; i < PlaylistPlugins.length; i++) {
                let plugin = PlaylistPlugins[i];
                let files = await plugin.find(this.folder);
                for (let j = 0; j < files.length; j++) {
                    let data = await plugin.load(files[j]);
                    if (data) {
                        this.addPlaylist(data.file, data.songs);
                    }
                }
            }

        }

        addSong(file, metadata) {

            let song = {
                uuid: uuid(),
                metadata: metadata,
                title: metadata.title,
                artist: metadata.albumartist[0],
                album: metadata.album,
                file: file
            };

            // If has images, use only first one
            if (metadata.picture.length > 0) {
                song.image = metadata.picture[0];
                delete song.metadata.picture;
            }

            this.songs.push(song);

            return song;

        }
        addPlaylist(name, files) {

            let playlist = {
                name: name,
                // Collection of song uuid's
                songs: []
            }

            for (let i = 0; i < files.length; i++) {
                let file = files[i].file;
                file = path.normalize(file);
                for (let j = 0; j < this.songs.length; j++) {
                    let song = this.songs[j];
                    if (file === path.normalize(song.file)) {
                        playlist.songs.push(song);
                    }
                }
            }

            this.playlists[name] = playlist;

            return playlist;

        }

    }

    if (module) {
        module.exports = MusicFolder;
    } else {
        global.MusicFolder = MusicFolder;
    }

})(this);
