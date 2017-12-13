import * as fs from '@rammbulanz/afs'
import * as path from 'path';
import * as MusicMetadata from 'musicmetadata';

export interface IMusicMetaData {
	artist: string[]
	album: string
	albumartist: string
	year: string
	track: { no: number, of: number }
	disk: { no: number, of: number },
	genre: string[],
	picture: Array<{ format: string, data: Buffer }>
	duration: number
}


export function getMetadata(file: string): Promise<MM.Metadata> {

	return new Promise(function (resolve, reject) {

		var readStream = fs.createReadStream(file);

		let parser = MusicMetadata(readStream, function (err, result) {

			if (err) {
				reject(err);
			} else {
				readStream.close();
				resolve(result);
			}

		});

	});
}