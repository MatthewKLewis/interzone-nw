const fs = require('fs');
const Actor = require('./actor');
const Defaults = require('./defaults')
const d = new Defaults();

class Player extends Actor {

    //player unique stats
    stepsTaken = 0;

    constructor(playerJSON = d.PLAYER) {
        super(playerJSON.name, playerJSON.x, playerJSON.y, playerJSON.alive);
        this.lastWorldPositionX = this.x;
        this.lastWorldPositionY = this.y;
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