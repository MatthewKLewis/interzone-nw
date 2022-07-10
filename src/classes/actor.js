class Actor {
    constructor(name, x, y, alive) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.index = this.x + (this.y * 88);
        this.alive = alive;
    }
}

module.exports = Actor;