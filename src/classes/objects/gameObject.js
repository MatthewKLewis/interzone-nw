class GameObject {
    constructor(x, y, name, ownedBy) {
        this.x = x;
        this.y = y,
        this.name = name;
        this.ownedBy = ownedBy;

        this.tileUrl = 'powerup.png'
        this.regionIndex = x + (y * 88);
    }
}

module.exports = GameObject;