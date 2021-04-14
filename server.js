const http = require("http");
const qs = require("querystring");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable")
const DataStore = require("./dataStore")

function prepareAlbumsData() {
    const mp3Path = path.join(__dirname, "./static/mp3");
    return fs.readdirSync(mp3Path).map(file => {
        let tmpObj = {
            name: file,
            coverUrl: "",
            filesList: [],
        }
        let albumPath = path.join(mp3Path, file)
        if (!fs.statSync(albumPath).isDirectory()) return;
        fs.readdirSync(albumPath).forEach(albumFile => {
            if (albumFile.endsWith(".png") || albumFile.endsWith(".jpg")) {
                tmpObj.coverUrl = "http://localhost:3000/static/mp3/" + file + "/" + albumFile;
            } else if (albumFile.endsWith(".mp3")) {
                tmpObj.filesList.push({
                    src: "http://localhost:3000/static/mp3/" + file + "/" + albumFile,
                    albumName: file,
                    size: Math.floor(fs.statSync(path.join(albumPath, albumFile)).size / (1024 * 1024)),
                })
            }
        });
        tmpObj.filesList.map(song => {
            song.coverUrl = tmpObj.coverUrl;
            return song
        });
        return tmpObj;
    });
}

const dataStore = new DataStore();

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
    res.setHeader('Access-Control-Allow-Headers', '*');
    const requestUrl = decodeURIComponent(req.url);
    switch (req.method) {
        case "OPTIONS":

            break;
        case "POST":
            if (requestUrl.startsWith("/albums")) {
                let requestData;

                req.on('data', data => {
                    requestData += data;
                });

                req.on('end', data => {
                    const parsedData = qs.parse(requestData);
                    res.end(JSON.stringify(prepareAlbumsData()))
                });
            } else if (requestUrl.startsWith("/playlist")) {
                let requestData;

                req.on('data', data => {
                    requestData += data;
                });

                req.on('end', data => {
                    const parsedData = qs.parse(requestData);
                    parsedData.src = parsedData.undefinedsrc;
                    delete parsedData["undefinedsrc"];
                    dataStore.AddSongToPlaylist(parsedData);
                    res.writeHead(200);
                    res.end();
                });
            } else if (requestUrl.startsWith("/upload")) {
                let form = formidable({})

                let tmpDir = path.join(__dirname, "./tmp/")
                if (!fs.existsSync(tmpDir)) {
                    fs.mkdirSync(tmpDir);
                }
                let targetDir = path.join(__dirname, "./static/mp3/Upload/")
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir);
                }

                form.uploadDir = tmpDir
                form.keepExtensions = true
                form.multiples = true


                form.parse(req, function (err, fields, files) {
                    let filesToProcess = files.file.length !== undefined ? files.file : [files.file];
                    filesToProcess.forEach(file => {
                        fs.rename(file.path, path.join(targetDir, file.name), function (err) {
                            if (err)
                                throw err;
                        });
                    });
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(filesToProcess));
                });
            }
            break;

        case "GET":
            if (requestUrl.startsWith("/playlist")) {
                let songs = await dataStore.GetSongs();
                res.end(JSON.stringify(songs));
                return;
            }
            if (requestUrl.startsWith("/admin")) {
                fs.readFile(path.join(__dirname, "admin.html"), (err, data) => {
                    let info = fs.statSync(path.join(__dirname, "admin.html"));
                    res.writeHead(200, {'Content-Type': 'text/html', "Content-Length": info.size})
                    res.write(data);
                    res.end()
                });
                return
            }
            fs.readFile(path.join(__dirname, requestUrl), (err, data) => {
                if (!!err) {
                    res.writeHead(404);
                    res.end();
                    return;
                }
                let info = fs.statSync(path.join(__dirname, requestUrl));
                let mimetype = "text/plain";
                switch (requestUrl.split('.').pop()) {
                    case "jpg":
                        mimetype = "image/jpg";
                        break;
                    case "png":
                        mimetype = "image/png";
                        break;
                    case "mp3":
                        mimetype = "audio/mpeg"
                        break;
                }
                res.writeHead(200, {'Content-Type': mimetype, "Content-Length": info.size, "Accept-Ranges": "bytes"});
                res.write(data);
                res.end();
            })
    }
})

server.listen(3000, () => {
    console.log("Server listening on port 3000")
})
