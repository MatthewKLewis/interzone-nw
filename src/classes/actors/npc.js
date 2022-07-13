const Actor = require('./actor');

class NPC extends Actor {
    constructor(name, x, y, alive) {
        super(name, x, y, alive);
        this.lastWorldPositionX = x;
        this.lastWorldPositionY = y;
        this.savePlayer();
    }

    update() {
        
    }

    move(dir) {
        this.lastX = this.x;
        this.lastY = this.y;
        switch (dir) {
            case 'up': this.y--; break;
            case 'right': this.x++; break;
            case 'down': this.y++; break;
            case 'left': this.x--; break;
        }
        this.index = this.x + (this.y * 88);
    }
}

module.exports = Player;