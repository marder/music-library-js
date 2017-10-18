var fs = require("fs-extra");
var path = require("path");
let glob = require("glob");

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

        async load (file) {

            if ( /\.ogg$/.test( file ) === false ) return;
            
            return new Promise(function (resolve, reject) {

                // Ogg does not contain metadata like artist, album, title etc
                // So just return as file

                resolve({
                    type: "song",
                    file: file,
                    metadata: null
                })
            });
        }
    }
}