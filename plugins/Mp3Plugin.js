(function () {

    let glob = require("glob");
    var fs = require("fs-extra");
    var path = require("path");
    //var MusicMetadata = require("musicmetadata");
    var getMetadata = require("../utils/MusicMetadata.js");

    module.exports = function Mp3Plugin() {
        return {
            async find(dir) {
                return new Promise(function (resolve, reject) {
                    glob(path.join(dir, "**/*.mp3"), function (err, files) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(files);
                        }
                    });
                }).catch(console.error);
            },

            async load(file) {

                if (/\.mp3$/.test(file) === false) return;

                return {
                    type: "song",
                    file: file,
                    metadata: await getMetadata(file)
                }
            }
        }
    }

})();