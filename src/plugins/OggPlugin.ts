import * as glob from 'glob';
import * as fs from '@rammbulanz/afs';
import * as path from 'path';
import * as audioMetadata from "audio-metadata";

export namespace OggPlugin {

    export function find(dir) {
        return new Promise(function (resolve, reject) {
            glob(path.join(dir, "**/*.ogg"), function (err, files) {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        }).catch(console.error);
    }

    export async function load(file) {

        if (/\.ogg$/.test(file) === false) return;

        let buffer = await fs.readFile(file);
        let metadata = audioMetadata.ogg(buffer);

        return {
            type: "song",
            file: file,
            metadata: metadata
        };

    }

}