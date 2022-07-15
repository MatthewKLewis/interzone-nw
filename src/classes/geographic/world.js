const fs = require('fs');
const RegionPeek = require('./regionPeek');

//
// The world class reaches down into the RegionPeeks and alters their elevation and images.
// This should be the only world, and the only class that reaches in to RegionPeek
//

class World {
    regions = [];
    kingdoms = [];
    constructor(regions = []) {
        if (regions.length > 0) {
            this.regions = regions;
        } else {
            this.initialNoise();

            //geology
            this.smooth();
            this.zigguratize();
            this.addElevationNoise();

            //add settlements
            this.addKingdoms();
            this.expandKingdoms();
            this.contractKingdoms();

            this.assignNames();
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

    smooth(iterations = 3) {
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

    addKingdoms() {
        for (let k = 400; k < this.regions.length; k++) {
            if (this.regions[k].elevation > 0) {
                this.regions[k].settlement = 1;
                this.regions[k].settlementName = 'wun';
                break;
            }
        }
        for (let k = 1000; k < this.regions.length; k++) {
            if (this.regions[k].elevation > 0) {
                this.regions[k].settlement = 1;
                this.regions[k].settlementName = 'tou';
                break;
            }
        }
        for (let k = 2000; k < this.regions.length; k++) {
            if (this.regions[k].elevation > 0) {
                this.regions[k].settlement = 1;
                this.regions[k].settlementName = 'tre';
                break;
            }
        }
        for (let k = 3000; k < this.regions.length; k++) {
            if (this.regions[k].elevation > 0) {
                this.regions[k].settlement = 1;
                this.regions[k].settlementName = 'for';
                break;
            }
        }
        for (let k = 4000; k < this.regions.length; k++) {
            if (this.regions[k].elevation > 0) {
                this.regions[k].settlement = 1;
                this.regions[k].settlementName = 'fyv';
                break;
            }
        }
        for (let k = 5000; k < this.regions.length; k++) {
            if (this.regions[k].elevation > 0) {
                this.regions[k].settlement = 1;
                this.regions[k].settlementName = 'six';
                break;
            }
        }
    }

    expandKingdoms(iterations = 10) {
        for (let i = 1; i < iterations; i++) {
            let matchingSettlements = this.regions.filter(reg => reg.settlement == 1)
            matchingSettlements.forEach((reg) => {
                reg.settlement = reg.settlement + 1;
                let neighbors = this.getNeighboringRegions(reg.index);
                neighbors = neighbors.map((nei) => { 
                    if (nei && nei.elevation > 0 && nei.settlement < iterations && Math.random() > 0.3) { 
                        nei.settlement = nei.settlement + 1 
                        nei.settlementName = reg.settlementName;
                    } 
                })
            })
        }
    }

    contractKingdoms() {
        let allSettledRegions = this.regions.filter((reg) => reg.settlement > 0)
        for (let i = 0; i < allSettledRegions.length; i++) {
            Math.random() > 0.6 ? allSettledRegions[i].settlement-- : null;            
        }
    }

    assignImages() {
        for (let i = 0; i < this.regions.length; i++) {
            this.regions[i].assignImage();
        }
    }

    assignNames() {
        for (let i = 0; i < this.regions.length; i++) {
            this.regions[i].assignName();
        }
    }

    //Utils:
    findAppropriateStartingLocationForPlayer() {
        for (let i = 2800; i < this.regions.length; i++) {
            if (this.regions[i].elevation == 1) {
                return [this.regions[i].x, this.regions[i].y]
            }
        }
    }

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

    //Interaction
    discoverRegionAt(indexOfRegion) {
        this.regions[indexOfRegion].discovered = true;
    }

}

module.exports = World;