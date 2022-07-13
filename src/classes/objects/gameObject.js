class GameObject {
    constructor(x, y, name, ownedBy) {
        this.x = x;
        this.y = y,
        this.regionIndex = x + (y * 88)
        this.name = name;
        this.ownedBy = ownedBy;
        this.tileUrl = 'powerup.png'
    }
}

module.exports = GameObject;