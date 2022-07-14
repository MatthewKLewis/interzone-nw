const fs = require('fs');

class SoundManager {
    sounds = new Map() //string, Image
    music = new Map() //string, Image
    constructor() {
        var files = fs.readdirSync('../src/assets/sounds/sfx');
        files.forEach((file)=>{
            console.log(file);
            let tempAudio = new Audio();
            tempAudio.src = `./assets/sounds/sfx/${file}`
            tempAudio.volume = 0.4
            this.sounds.set(file, tempAudio);
        })

        files = fs.readdirSync('../src/assets/sounds/music');
        files.forEach((file)=>{
            console.log(file);
            let tempAudio = new Audio();
            tempAudio.src = `./assets/sounds/music/${file}`
            tempAudio.volume = 0.4
            this.music.set(file, tempAudio);
        })
    }
}

module.exports = SoundManager