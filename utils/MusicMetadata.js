var fs = require("fs");
var path = require("path");
var MusicMetadata = require("musicmetadata");


// example musicmetadata result
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


module.exports = function (file) {

    return new Promise(function (resolve, reject) {

        var readStream = fs.createReadStream(file);

        let parser = new MusicMetadata(readStream, function (err, result) {

            if (err) {
                reject(err);
            } else {
                readStream.close();
                resolve(result);
            }

        });

    });
}