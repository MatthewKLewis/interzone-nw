const GameObject = require("./gameObject");

class Light extends GameObject {
    
    //tileUrl, regionIndex
    constructor(x, y, name, ownedBy, lightIntensity) {
        super(x,y,name,ownedBy);
        this.inventoryUrl = '';
        this.lightIntensity = lightIntensity;
        this.tileUrl = 'lamp.png'
    }
}

module.exports = Light;