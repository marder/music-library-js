import * as fs from '@rammbulanz/afs'
import * as MM from 'musicmetadata'

export interface Song {
    file: string
    title: string
    artist: string
    album: string
    year: string
    duration: number
    pictures: any
}

export function createSong(file: string, picturesAsDataUrl?: boolean): Promise<Song> {

    return new Promise(function (fulfill, reject) {

        let readStream = fs.createReadStream(file);

        MM(readStream, function (err, metadata) {

            if (err) {
                reject(err);
                return;
            }

            try {

                let song: Song = {
                    title: metadata.title || "Unknown Title",
                    album: metadata.album || "Unknown Album",
                    artist: "Unknown Arist",
                    duration: metadata.duration,
                    year: metadata.year,
                    file: file,
                    pictures: null
                };

                if (metadata.albumartist.length > 0) {
                    song.artist = metadata.albumartist[0];
                } else if (metadata.artist.length > 0) {
                    song.artist = metadata.artist[0];
                }

                fulfill(song);

            } catch (err) {
                reject(err);
            }

        })

    });

}