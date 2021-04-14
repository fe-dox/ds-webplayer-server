const Nedb = require("nedb");
const path = require("path");

class DataStore {
    datastore;

    constructor() {
        this.datastore = new Nedb({
            filename: path.join(__dirname, "playlist.db"),
            autoload: true,
        })
    }

    AddSongToPlaylist(song) {
        song._dbAddDate = Date.now();
        this.datastore.insert(song)
    }

    GetSongs() {
        return new Promise((resolve, reject) => {
            this.datastore.find({}).sort({_dbAddDate: -1}).exec((err, docs) => {
                if (!!err) {
                    reject(err)
                }
                docs = docs.map(doc => {
                    delete doc["_id"];
                    delete doc["_dbAddDate"]
                    return doc;
                })
                resolve(docs)
            })
        })

    }
}

module.exports = DataStore;
