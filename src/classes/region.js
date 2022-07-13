const fs = require('fs');
const Tile = require('./tile');
const GameObject = require('./objects/gameObject')

//
// The region class reaches down into the tiles and alters their character and images.
//

class Region {
    tiles = [];
    items = [];
    actors = [];
    constructor(regionPeek = {}, regionFullData = {}) {
        if (regionPeek) {
            this.name = regionPeek.name;
            this.x = regionPeek.x;
            this.y = regionPeek.y;
            this.index = regionPeek.index;
            this.elevation = regionPeek.elevation;
            this.latitude = regionPeek.latitude;
            this.temperature = regionPeek.temperature;
            this.overworldTileUrl = regionPeek.tileUrl
            this.initialNoise();

            //do something here. take on a characterization. tell the tiles to do something.
            this.placePowerups();

            this.assignImages();
            this.saveRegion();
        }
        else if (regionFullData) {
            //addLog('reconstitute region from file with tiles');
            this.name = regionFullData.name;
            this.x = regionFullData.x;
            this.y = regionFullData.y;
            this.index = regionFullData.index;
            this.elevation = regionFullData.elevation;
            this.latitude = regionFullData.latitude;
            this.temperature = regionFullData.temperature;
            this.tiles = regionFullData.tiles
        }
        else {
            //addLog('error creating region')
        }
    }

    initialNoise() {
        for (let y = 0; y < 64; y++) {
            for (let x = 0; x < 88; x++) {
                this.tiles.push(new Tile(x, y, Math.random() > 0.99 ? 1 : 0, this.overworldTileUrl))
            }
        }
    }

    placePowerups() {
        for (let y = 0; y < 64; y++) {
            for (let x = 0; x < 88; x++) {
                Math.random() > 0.99 && this.items.push(new GameObject(x, y, 'Trash', 'Increate'));
            }
        }
    }

    assignImages() {
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].assignImage();            
        }
    }

    getTileAtMouse(x, y) {
        let tileX = Math.floor(x / 16)
        let tileY = Math.floor(y / 16)
        return this.tiles[tileX + (tileY * 88)]
    }

    saveRegion() {
        fs.writeFileSync(`./assets/world/region${this.index}.json`, JSON.stringify(this), err => {
            if (err) {
                //error condition
            }
        });
    }
}

module.exports = Region;