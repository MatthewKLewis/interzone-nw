const GameObject = require("./gameObject");

class Light extends GameObject {
    
    //tileUrl, regionIndex
    constructor(x, y, name, ownedBy) {
        super(x,y,name,ownedBy);
        this.inventoryUrl = '';
        this.lightLevel = 2;
        this.tileUrl = 'lamp.png'
    }
}

module.exports = Light;