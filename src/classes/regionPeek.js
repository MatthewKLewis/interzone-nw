const SciFi = require('./scifi');
const sfu = new SciFi()

class RegionPeek {
    constructor(x, y, elevation) {
        this.name = 'error';
        this.tileUrl = 'grass.png';

        this.x = x;
        this.y = y;
        this.index = x + (y * 88)
        this.elevation = elevation;
        this.latitude = Math.abs(32 - y); //range from 1 to 32
        this.temperature = 99 - (this.latitude * 2.5) - (this.elevation * 10);
        
        this.discovered = false;
        this.settlement = 0;
    }

    assignImage() {
        switch (this.settlement) {
            case 1: this.tileUrl = 'settlement1.png'; return;
            case 2: this.tileUrl = 'settlement2.png'; return;
            case 3: this.tileUrl = 'settlement3.png'; return;
            case 4: this.tileUrl = 'settlement4.png'; return;
            case 5: this.tileUrl = 'settlement5.png'; return;
            case 6: this.tileUrl = 'settlement6.png'; return;
            case 7: this.tileUrl = 'settlement6.png'; return;
            case 8: this.tileUrl = 'settlement6.png'; return;
            case 9: this.tileUrl = 'settlement6.png'; return;
        }

        if (this.temperature < 32) {
            if (this.elevation == 0) {
                this.tileUrl = 'ice.png'
            } else {
                this.tileUrl = 'snow.png'
            }
            return;
        }
        else if (this.temperature >= 32) {
            if (this.elevation == 0) {
                this.tileUrl = 'water.png'
                return;
            }

            if (this.elevation > 5) {
                this.tileUrl = null;
                return;
            }

            let randInt = Math.floor(Math.random() * 5)
            switch (randInt) {
                case 1: this.tileUrl = 'beach.png'; break;
                case 2: this.tileUrl = 'grass.png'; break;
                case 3: this.tileUrl = 'forest.png'; break;
                case 4: this.tileUrl = 'rock2.png'; break;
                case 5: this.tileUrl = 'rock.png'; break;
            }           
        }
    }

    assignName() {
        this.name = sfu.generateRegionName(this);
    }
}

module.exports = RegionPeek;