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
    }
}

module.exports = RegionPeek;