import * as path from 'path';
import * as fs from '@rammbulanz/afs'
import { Song, createSong } from "./Song"
import { Playlist } from './Playlist';

export namespace PlaylistParser {

    export async function getPlaylist(file: string): Promise<Playlist> {
        return await parsers[path.extname(file)](file);
    }

    const parsers = {
        // "Extension": "ParserFunction"
        ".wpl": parseWpl,
        ".playlist": parsePlaylist
    }

    async function parsePlaylist(file: string): Promise<Playlist> {
        let playlist: Playlist = {
            name: path.basename(file),
            songs: new Array()
        };

        let folder = path.dirname(file);
        let content = await fs.readFile(file, "utf8") as string;

        let lines = content.split("\n");
        for (let i=0; i<lines.length; i++) {

            let line = lines[i].trim();

            // Ignore lines that start with '#'
            if (line.charAt(0) === "#") {
                continue;
            }

            // Ignore empty lines
            if (line.length === 0) {
                continue;
            }

            let file = path.join(folder, line);
            let fileExists = await fs.exists(file);

            // Ignore matched filenames that don't exist
            if (!fileExists) {
                continue;
            }

            let song = await createSong(file, false);
            playlist.songs.push(song);

        }

        return playlist;
    }

    async function parseWpl(file: string): Promise<Playlist> {

        let playlist: Playlist = {
            name: path.basename(file),
            songs: new Array()
        };

        return playlist;
    }

}