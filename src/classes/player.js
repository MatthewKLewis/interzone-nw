const fs = require('fs');
const Actor = require('./actor');

class Player extends Actor {

    constructor(playerJSON) {
        super(playerJSON.name, playerJSON.x, playerJSON.y, playerJSON.alive, playerJSON.maxHealth);
        this.lastWorldPositionX = this.x;
        this.lastWorldPositionY = this.y;
        this.experience = playerJSON.experience
        this.savePlayer();
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
        this.stepsTaken++;
    }

    moveBack() {
        this.x = this.lastX;
        this.y = this.lastY;
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

    savePlayer() {
        fs.writeFileSync('./assets/player/player.json', JSON.stringify(this), err => {
            if (err) {
                //error condition
            }
        });
    }
}

module.exports = Player;