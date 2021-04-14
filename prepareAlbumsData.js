const path = require('path')
const fs = require("fs");


exports.default = function prepareAlbumsData() {
    const mp3Path = path.join(__dirname, "./static/mp3");
    return fs.readdirSync(mp3Path).map(file => {
        let tmpObj = {
            name: file,
            coverUrl: "",
            filesList: [],
        }
        let albumPath = path.join(mp3Path, file)
        if (!fs.lstatSync(albumPath).isDirectory()) return;
        fs.readdirSync(albumPath).forEach(albumFile => {
            if (albumFile.endsWith(".png") || albumFile.endsWith(".jpg")) {
                tmpObj.coverUrl = "/static/" + file + "/" + albumFile;
            } else if (albumFile.endsWith(".mp3")) {
                tmpObj.filesList.push("/static/" + file + "/" + albumFile)
            }
        })
        return tmpObj;
    });
}


