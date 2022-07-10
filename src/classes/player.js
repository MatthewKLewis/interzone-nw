const Actor = require('./actor');

class Player extends Actor {
    constructor(name, x, y, alive) {
        super(name, x, y, alive);
        this.lastWorldPositionX = x;
        this.lastWorldPositionY = y;
    }

    move(dir) {
        switch (dir) {
            case 'up': this.y--; break;
            case 'right': this.x++; break;
            case 'down': this.y++; break;
            case 'left': this.x--; break;
        }
        this.index = this.x + (this.y * 88);
    }

    moveToLastWorldPosition() {
        this.x = this.lastWorldPositionX;
        this.y = this.lastWorldPositionY;
    }

    saveWorldPosition() {
        this.lastWorldPositionX = this.x;
        this.lastWorldPositionY = this.y;
    }
}

module.exports = Player;