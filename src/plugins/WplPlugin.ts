import * as glob from 'glob';
import * as fs from '@rammbulanz/afs';
import * as path from 'path';
import * as xml2js from 'xml2js';


export namespace WplPlugin {

    export async function load(file: string) {

        if (/\.wpl$/.test(file) === false) return;

        return new Promise(function (resolve, reject) {

            let songs = [];

            // Example for a ".wpl" file
            // <?wpl version="1.0" ?>
            // <smil>
            //    <head>
            //       <title>Musik</title>
            //    </head>
            //    <body>
            //        <seq>
            //           <media src="./relative/path/to/file.mp3" />
            //           ...
            //        </seq>
            //    </body>
            // </smil>

            fs.readFile(file).then(function (content) {

                xml2js.parseString(content, function (err, result) {
                    if (err) {
                        reject(err);
                        return;
                    } else {

                        var songs = [];

                        // ToDo - parse result
                        // ToDo - use other plugins to check <media> files

                        resolve({
                            type: 'playlist',
                            name: path.basename(file),
                            songs: songs
                        });
                    }
                });

            });
        });

    }
}