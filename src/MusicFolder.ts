import * as fs from '@rammbulanz/afs';
import * as path from 'path';
import * as walk from 'walk';
import * as uuid from 'uuid';
import * as glob from 'glob';
import * as MusicMetadata from 'musicmetadata';

import { Song } from './Song';
import { Playlist } from './Playlist';
import { PlaylistParser } from './PlaylistParsers';

export interface IMusicFolder {
    folder: string
    songs: Array<Song>
    playlists: Array<Playlist>
}

export class MusicFolder implements IMusicFolder {

    static get PlaylistExtensions() {
        return [
            ".playlist",
            ".wpl"
        ]
    }
    static get AudioExtensions() {
        return [
            ".mp3",
            ".flac",
            ".wav",
            ".aac",
            ".ac3"
        ];
    }


    folder: string;
    songs: Array<Song> = [];
    playlists: Array<Playlist> = [];

    get cacheFile() {
        return path.join(this.folder, "marder-music-cache.json");
    }

    constructor(folder) {

        this.folder = folder;

    }

    async load() {
        if (await fs.exists(this.cacheFile)) {
            this.loadCacheFile();
        } else {
            await this.scan();
        }
    }

    loadCacheFile() {

        let cache: IMusicFolder = require(this.cacheFile);

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

    scan() {

        console.log("Start scanning " + this.folder);

        return new Promise(function (fulfill, reject) {

            let gwc = path.join(this.folder, '*');

            glob(gwc, async function (err, files) {

                if (err) {
                    reject(err);
                    return;
                }

                for (let file of files) {

                    let exists = await fs.exists(file);
                    let stats = await fs.stat(file);

                    if (!stats.isFile()) {
                        continue;
                    }

                    let extension = path.extname(file);
                    
                    let isAudioFile = MusicFolder.AudioExtensions.indexOf(extension) > -1;
                    let isPlaylistFile = MusicFolder.PlaylistExtensions.indexOf(extension) > -1;

                    if (!isAudioFile && !isPlaylistFile) {
                        // File is neither an audio file nor a playlist file. Ignore it
                        continue;
                    }

                    if (isAudioFile) {

                    } else if (isPlaylistFile) {

                        let playlist = PlaylistParser.getPlaylist(file);

                    }

                }

            })

        });


    }

}