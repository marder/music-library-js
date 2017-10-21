var fs = require("fs-extra");
var path = require("path");
let glob = require("glob");
let audioMetadata = require("audio-metadata");

module.exports = function OggPlugin() {
    return {
        async find(dir) {
            return new Promise(function (resolve, reject) {
                glob(path.join(dir, "**/*.ogg"), function (err, files) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(files);
                    }
                });
            }).catch(console.error);
        },

        async load(file) {

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
}