class Actor {
    constructor(name, x, y, alive, maxHealth) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.lastX = x;
        this.lastY = y;
        this.index = this.x + (this.y * 88);
        this.alive = alive;
        this.maxHealth = maxHealth;
        this.health = maxHealth;
    }
}

module.exports = Actor;