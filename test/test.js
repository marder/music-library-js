let { MusicFolder } = require("../index.js");

var musicFolder = new MusicFolder("E:/Data/Music");


console.log("Start scanning " + musicFolder.folder);
musicFolder.scan(function (file, item) {
    console.log(`'${file}' passed all checks`);
}).then(function () {
    console.log("Music Fodler scanned")
    console.log(musicFolder)
    console.log("Test fulfilled");
}).catch(function (err) {
    console.error("Test failed.");
    console.error(err);
})