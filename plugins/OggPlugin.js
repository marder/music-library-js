function OggPlugin() {
    return {
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