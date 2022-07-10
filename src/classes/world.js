const fs = require('fs');
const RegionPeek = require('./regionPeek');
const SciFi = require('./scifi')

//
// The world class reaches down into the RegionPeeks and alters their elevation and images.
// This should be the only world, and the only class that reaches in to RegionPeek
//

class World {
    regions = [];
    constructor(regions = []) {
        if (regions.length > 0) {
            //console.log("loading existing world")
            this.regions = regions;
        } else {
            //console.log("creating new world")
            this.initialNoise();
            this.smooth(3);
            this.zigguratize();
            this.addElevationNoise();
            this.assignImages();
            this.saveWorld();
        }
    }

    initialNoise() {
        for (let y = 0; y < 64; y++) {
            for (let x = 0; x < 88; x++) {
                this.regions.push(new RegionPeek(x, y, Math.random() > 0.42 ? 1 : 0))
            }
        }
        //console.log(this.regions);
    }

    smooth(iterations = 1) {
        for (let i = 0; i < iterations; i++) {
            for (let i = 0; i < this.regions.length; i++) {
                const neighboringRegions = this.getNeighboringRegions(i);
                let totalSum = 0
                let lengthNonNull = 0
                for (let i = 0; i < neighboringRegions.length; i++) {
                    if (neighboringRegions[i]) {
                        totalSum += neighboringRegions[i].elevation;
                        lengthNonNull++;
                    }
                }
                if (totalSum == 3 || totalSum == 4) {
                    this.regions[i].elevation = 1;
                }
                if (totalSum == 1 || totalSum == 0) {
                    this.regions[i].elevation = 0;
                }
            }
        }
    }

    zigguratize(iterations = 9) {
        for (let currentLevel = 0; currentLevel < iterations; currentLevel++) {

            for (let i = 0; i < this.regions.length; i++) {
                const neighboringRegions = this.getNeighboringRegions(i);
                let raise = true;
                for (let j = 0; j < neighboringRegions.length; j++) {
                    if (neighboringRegions[j] && neighboringRegions[j].elevation <= currentLevel) {
                        raise = false;
                    }
                }
                if (raise) { this.regions[i].elevation = (this.regions[i].elevation + 1) }
            }

        }
    }

    addElevationNoise() {
        for (let i = 0; i < this.regions.length; i++) {
            if (this.regions[i].elevation != 0 && this.regions[i].elevation != 9) {
                Math.random() > 0.8 ? this.regions[i].elevation++ : null
            }
        }
    }

    assignImages() {
        for (let i = 0; i < this.regions.length; i++) {
            this.regions[i].assignImage();
        }
    }

    //Utils:
    getRegionAtMouse(x, y) {
        let tileX = Math.floor(x / 16)
        let tileY = Math.floor(y / 16)
        return this.regions[tileX + (tileY * 88)]
    }

    getNeighboringRegions(regionIndex) {
        let neiReg = []
        neiReg[0] = this.regions[regionIndex - 88] || null; //NORTH
        neiReg[1] = this.regions[regionIndex + 1] || null; //EAST
        neiReg[2] = this.regions[regionIndex + 88] || null; //SOUTH
        neiReg[3] = this.regions[regionIndex - 1] || null; //WEST
        return neiReg;
    }

    saveWorld() {
        fs.writeFileSync('./assets/world/world.json', JSON.stringify(this), err => {
            if (err) {
                //error condition
            }
        });
    }

}

module.exports = World;