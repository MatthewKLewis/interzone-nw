class Actor {
    constructor(name, x, y, X, Y, alive, maxHealth) {
        this.name = name;

        this.x = x;
        this.y = y;
        this.lastx = x;
        this.lasty = y;

        this.X = X;
        this.Y = Y;
        this.lastX = X;
        this.lasyY = Y;

        this.worldIndex = this.X + (this.Y * 88);
        this.regionIndex = this.x + (this.y * 88);

        this.alive = alive;
        this.maxHealth = maxHealth;
        this.health = maxHealth;
    }
}

module.exports = Actor;