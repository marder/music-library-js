(function (global) {

    var fs = require("fs-extra");
    var path = require("path");
    var xml2js = require('xml2js');

    function WplPlugin() {
        return {
            async load( file ) {

                if ( /\.wpl$/.test( file ) === false ) return;

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
        };
    }

    if (module) {
        module.exports = WplPlugin;
    } else {
        global.WplPlugin = WplPlugin
    }

})(this);
