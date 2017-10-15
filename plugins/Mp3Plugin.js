(function () {

    var fs = require("fs-extra");
    var path = require("path");
    //var MusicMetadata = require("musicmetadata");
    var getMetadata = require("../utils/MusicMetadata.js");

    module.exports = function Mp3Plugin() {
        return {
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