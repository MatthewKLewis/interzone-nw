const fs = require('fs');
const Tile = require('./tile');
const Weapon = require('../objects/weapon')
const Light = require('../objects/light')
const NPC = require('../actors/npc')

//
// The region class reaches down into the tiles and alters their character and images.
//

class Region {
    tiles = [];
    items = [];
    actors = [];
    lights = [];
    constructor(regionPeek = {}, regionFullData = {}) {
        if (regionPeek) { //create a brand new region
            this.name = regionPeek.name;
            this.x = regionPeek.x;
            this.y = regionPeek.y;
            this.index = regionPeek.index;
            this.elevation = regionPeek.elevation;
            this.latitude = regionPeek.latitude;
            this.temperature = regionPeek.temperature;
            this.overworldTileUrl = 'grass.png'
            this.initialNoise();

            //do something here. take on a characterization. tell the tiles to do something.
            this.placePowerups();

            //add npcs
            this.placeDwellings();
            this.placeLights();
            this.placeNPCs()

            //finally determine the entry point
            this.entryPoint = this.determineEntryPoint();

            this.assignImages();
            this.saveRegion();
        }
        else if (regionFullData) { //recreate the region from file
            this.name = regionFullData.name

            this.x = regionFullData.x
            this.y = regionFullData.y
            this.index = regionFullData.index
            this.entryPoint = regionFullData.entryPoint

            this.elevation = regionFullData.elevation
            this.latitude = regionFullData.latitude
            this.temperature = regionFullData.temperature

            this.tiles = regionFullData.tiles
            this.items = regionFullData.items
            this.actors = regionFullData.actors
            this.lights = regionFullData.lights
        }
        else {
            //addLog('error creating region')
        }
    }

    initialNoise() {
        for (let y = 0; y < 64; y++) {
            for (let x = 0; x < 88; x++) {
                this.tiles.push(new Tile(x, y, 0, this.overworldTileUrl))
            }
        }
    }

    placePowerups() {
        for (let y = 0; y < 64; y++) {
            for (let x = 0; x < 88; x++) {
                Math.random() > 0.999 && this.items.push(new Weapon(x, y, 'Dagger', 'Increate'));
            }
        }
    }

    placeDwellings(iterations = 6) {
        for (let i = 0; i < iterations; i++) {
            let bldgWidth = this.randBetween(5, 12);
            let bldgHeight = this.randBetween(5, 12);
            let upLeftCorner = [this.randBetween(10, 60), this.randBetween(10, 50)];
            let buildingTiles = this.tiles.filter(tile =>
                tile.x >= upLeftCorner[0] && tile.x <= upLeftCorner[0] + bldgWidth &&
                tile.y >= upLeftCorner[1] && tile.y <= upLeftCorner[1] + bldgHeight
            );
            buildingTiles.forEach(tile => {
                tile.interior = true;
            })
            let buildingBorderTiles = buildingTiles.filter(tile => 
                (tile.x >= upLeftCorner[0] && tile.x <= upLeftCorner[0] + bldgWidth && (tile.y == upLeftCorner[1] || tile.y == upLeftCorner[1] + bldgHeight)) ||   //
                (tile.y >= upLeftCorner[1] && tile.y <= upLeftCorner[1] + bldgHeight && (tile.x == upLeftCorner[0] || tile.x == upLeftCorner[0] + bldgWidth))
            );
            buildingBorderTiles.forEach(tile => {
                tile.wall = Math.random() > 0.2 ? 1 : 0
            })
        }         
    }

    placeLights() {
        for (let y = 0; y < 64; y++) {
            for (let x = 0; x < 88; x++) {
                Math.random() > 0.999 && this.lights.push(new Light(x, y, 'Lamp', 'Increate', Math.floor(Math.random() * 10)));
            }
        }
    }

    placeNPCs() {
        for (let i = 0; i < this.tiles.length; i++) {
            if (!this.tiles[i].wall) {
                Math.random() > 0.999 && this.actors.push(new NPC('Grosvenor', this.tiles[i].x, this.tiles[i].y, true))
            }            
        }
    }

    assignImages() {
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].assignImage();
        }
    }

    //Utility
    determineEntryPoint() {
        for (let i = 2000; i < this.tiles.length; i++) {
            if (!this.tiles[i].wall) {
                return [this.tiles[i].x, this.tiles[i].y]
            }
        }
    }
    getNeighboringTiles(tileIndex) {
        let neiReg = []
        neiReg[0] = this.tiles[tileIndex - 88] || null; //NORTH
        neiReg[1] = this.tiles[tileIndex + 1] || null;  //EAST
        neiReg[2] = this.tiles[tileIndex + 88] || null; //SOUTH
        neiReg[3] = this.tiles[tileIndex - 1] || null;  //WEST
        return neiReg;
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
    randBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    //ActiveRendering
    setLightLevels() {
        //set all light levels to zero
        this.tiles.forEach(tile => {tile.lightLevel = 0})

        //for each light, find the tiles which are X distance from the light's X, and Y from Y (Pythagorean)
        //and set the distance from the light in the tile
        //then for each tile neighboring the light, set the new lightLevel as the intensity of the light minus the distance.
        for (let i = 0; i < this.lights.length; i++) {
            let lightsNeighboringTiles = [];
            let lightIsInterior = this.tiles[this.lights[i].regionIndex].interior;
            this.tiles.forEach((tile)=>{
                let distanceFromLight = Math.sqrt( 
                    Math.pow(Math.abs(tile.x - this.lights[i].x),2) + 
                    Math.pow(Math.abs(tile.y - this.lights[i].y),2) 
                )
                if (distanceFromLight < this.lights[i].lightIntensity && tile.interior == lightIsInterior) {
                    tile.distanceFromLight = distanceFromLight //property stuffing
                    lightsNeighboringTiles.push(tile)
                }
            });
            lightsNeighboringTiles.forEach(tile => {
                let newPotentialLightLevel = this.lights[i].lightIntensity - tile.distanceFromLight
                if (newPotentialLightLevel > tile.lightLevel) {
                    tile.lightLevel = newPotentialLightLevel;
                } else {
                    tile.lightLevel++;
                }
            });
        }
    }
}

module.exports = Region;