const SciFi = require('./scifi');
const sfu = new SciFi()

class RegionPeek {
    constructor(x, y, elevation) {
        this.name = sfu.generateSciFiName(3);
        this.x = x;
        this.y = y;
        this.index = x + (y * 88)
        this.elevation = elevation;
        this.latitude = Math.abs(32 - y); //range from 1 to 32
        this.temperature = 99 - (this.latitude * 2.5) - (this.elevation * 10);

        this.tileUrl = 'grass.png'
    }

    assignImage() {
        if (this.temperature < 32) {
            switch (this.elevation) {
                case 0:
                    this.tileUrl = 'ice.png'
                    break;            
                case 1:
                    this.tileUrl = 'snow.png'
                    break;
                default:
                    break;
            }
        }
        else if (this.temperature >= 32 && this.temperature < 85) {
            switch (this.elevation) {
                case 0:
                    this.tileUrl = 'water.png'
                    break;
                case 1:
                    this.tileUrl = 'beach.png'
                    break;
                case 2:
                    this.tileUrl = 'grass.png'
                    break;
                case 3:
                    this.tileUrl = 'forest.png'
                    break;
                case 4:
                    this.tileUrl = 'rock2.png'
                    break;            
                case 5:
                    this.tileUrl = 'rock.png'
                    break;            
                default:
                    break;
            }
        }
        else if (this.temperature >= 85) {
            switch (this.elevation) {
                case 0:
                    this.tileUrl = 'water.png'
                    break;
                case 1:
                    this.tileUrl = 'beach.png'
                    break;
                case 2:
                    this.tileUrl = 'grass.png'
                    break;
                case 3:
                    this.tileUrl = 'forest.png'
                    break;
                case 4:
                    this.tileUrl = 'rock2.png'
                    break;            
                case 5:
                    this.tileUrl = 'rock.png'
                    break;            
                default:
                    break;
            }
        }
    }
}

module.exports = RegionPeek;