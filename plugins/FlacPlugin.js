(function () {

    var fs = require("fs-extra");
    var path = require("path");
    var MusicMetadata = require("musicmetadata");

    module.exports = function FlacPlugin() {
        return {
            async load(file) {

                if ( /\.flac$/.test( file ) === false ) return;

                return new Promise(function (resolve, reject) {

                    let readStream = fs.createReadStream(file);

                    let parser = new MusicMetadata(readStream, function (err, result) {

                        if (err) {
                            resolve({
                                type: "error",
                                message: err
                            });
                            return;
                        }

                        readStream.close();

                        // Result will be somethin like that
                        // { 
                        //   artist : ['Spor'],
                        //   album : 'Nightlife, Vol 5.',
                        //   albumartist : [ 'Andy C', 'Spor' ],
                        //   title : 'Stronger',
                        //   year : '2010',
                        //   track : { no : 1, of : 44 },
                        //   disk : { no : 1, of : 2 },
                        //   genre : ['Drum & Bass'],
                        //   picture : [ { format : 'jpg', data : <Buffer> } ],
                        //   duration : 302.41 // in seconds 
                        // }

                        // for (let i = 0; i < result.picture.length; i++) {
                        //     let picture = result.picture[i];
                        //     result.picture[i] = `data:image/${picture.format};base64,` + picture.data;
                        // }

                        resolve({
                            type: "song",
                            file: file,
                            metadata: result
                        });
                    });
                });
            }
        }
    }

})();