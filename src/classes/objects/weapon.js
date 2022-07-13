const GameObject = require("./gameObject");

class Weapon extends GameObject {
    
    //tileUrl, regionIndex
    constructor(x, y, name, ownedBy) {
        super(x,y,name,ownedBy);
        this.inventoryUrl = '';
    }

    pickUp() {
        this.x = -1;
        this.y = -1;
    }
}

module.exports = Weapon;