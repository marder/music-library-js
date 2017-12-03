import * as fs from '@rammbulanz/afs';
import * as path from 'path';
import * as glob from 'glob';
import * as uuid from 'uuid';
import { MusicFilePlugin } from './MusicFilePlugin'
import { IPlugin } from './IPlugin';

let plugins = [
    MusicFilePlugin
];

export namespace PlaylistPlugin {

    /**
     * 
     * @param file 
     */
    export async function load(file) {

        if (/\.playlist$/.test(file) === false) return;

        return new Promise(async function (resolve, reject) {

            console.log("Testing playlist " + path.basename(file));

            let folder = path.dirname(file);

            let content = await fs.readFile(file, "utf8") as string;

            let songs = [];
            let name = path.basename(file);
            let lines = content.split("\n");

            // Trim extension
            name = name.replace(/\.[^/.]+$/, "");

            for (let i = 0; i < lines.length; i++) {

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

                    if (innerFile && await fs.exists(innerFile)) {
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

        });
    }

    /**
     * 
     * @param folder 
     */
    async function find(folder) {
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

}