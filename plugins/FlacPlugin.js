(function () {

    var fs = require("fs-extra");
    var path = require("path");
    var getMetadata = require("../utils/MusicMetadata.js");

    module.exports = function FlacPlugin() {
        return {
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