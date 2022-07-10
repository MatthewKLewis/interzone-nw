class Tile {
    constructor(x, y, wall, overworldImageUrl) {
        this.x = x;
        this.y = y;
        this.wall = wall;
        this.tileUrl = overworldImageUrl;
    }
}

module.exports = Tile;