class Tile {
    constructor(x, y, wall, overworldImageUrl) {
        this.x = x;
        this.y = y;
        this.wall = wall;
        this.interior = false;
        this.tileUrl = overworldImageUrl;
        this.lightLevel = 0;
    }

    assignImage() {
        if (this.wall) {
            this.interior = false;
            this.tileUrl = 'wall.png'
        }
    }
}

module.exports = Tile;