class Tile {
    constructor(x, y, wall, overworldImageUrl) {
        this.x = x;
        this.y = y;
        this.wall = wall;
        this.tileUrl = overworldImageUrl;
    }

    assignImage() {
        if (this.wall) {
            this.tileUrl = 'wall.png'
        }
    }
}

module.exports = Tile;