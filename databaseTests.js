const DataStore = require("./dataStore");


(async function(){
    let store = new DataStore();
    store.AddSongToPlaylist({
        "src": "http://localhost:3000/static/mp3/Dyan - Looking for Knives/01 - Another Way to Lose.mp3",
        "albumName": "Dyan - Looking for Knives",
        "size": 4,
        "coverUrl": "http://localhost:3000/static/mp3/Dyan - Looking for Knives/cover.jpg"
    })

    store.AddSongToPlaylist({
        "src": "http://localhost:3000/static/mp3/Fleetwood Mac - Rumours/01 - Dreams (2004 Remaster).mp3",
        "albumName": "Fleetwood Mac - Rumours",
        "size": 4,
        "coverUrl": "http://localhost:3000/static/mp3/Fleetwood Mac - Rumours/cover.jpg"
    })

    let songs = await store.GetSongs()
    console.log(songs)
})()
