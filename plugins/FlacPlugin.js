(function () {

    let glob = require("glob");
    let fs = require("fs-extra");
    let path = require("path");
    let getMetadata = require("../utils/MusicMetadata.js");

    module.exports = function FlacPlugin() {
        return {
            async find(dir) {
                return new Promise(function (resolve, reject) {
                    glob(path.join(dir, "**/*.flac"), function (err, files) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(files);
                        }
                    });
                }).catch(console.error);
            },

            async load(file) {

                if (/\.flac$/.test(file) === false) return;

                return {
                    type: "song",
                    file: file,
                    metadata: await getMetadata(file)
                }
            }
        }
    }

})();