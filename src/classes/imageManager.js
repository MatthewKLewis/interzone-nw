const fs = require('fs');

class ImageManager {
    images = new Map() //string, Image
    files = {}
    constructor() {
        var files = fs.readdirSync('../src/assets/tiles/');
        files.forEach((file)=>{
            let tempImg = new Image();
            tempImg.src = `./assets/tiles/${file}`
            this.images.set(file, tempImg);
        })
        console.log(this.images);
    }
}

module.exports = ImageManager