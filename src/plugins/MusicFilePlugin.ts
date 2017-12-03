import * as glob from 'glob';
import * as fs from '@rammbulanz/afs';
import * as path from 'path';
import { getMetadata } from '../MusicMetadata';


export namespace MusicFilePlugin {

    /**
     * 
     * @param dir 
     */
    export function find(dir: string) {
        return new Promise(function (resolve, reject) {
            glob(path.join(dir, "**/*.+(mp3|flac)"), function (err, files) {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        }).catch(console.error);
    }

    /**
     * 
     * @param file 
     */
    export async function load(file: string) {

        if (/^.*\.(mp3|flac)$/.test(file) === false) {
            return;
        }

        return {
            type: "song",
            file: file,
            metadata: await getMetadata(file)
        }
    }

}