const fs = require('fs');
const Actor = require('./actor');

class Player extends Actor {
    constructor(playerJSON) {
        super(playerJSON.name, playerJSON.x, playerJSON.y, playerJSON.X, playerJSON.Y, playerJSON.alive, playerJSON.maxHealth);
        this.experience = playerJSON.experience;
        this.tileUrl = 'player.png'
        this.savePlayer();
    }

    moveWorld(dir) {
        this.lastX = this.X;
        this.lastY = this.Y;
        switch (dir) {
            case 'up': this.Y--; break;
            case 'right': this.X++; break;
            case 'down': this.Y++; break;
            case 'left': this.X--; break;
        }

        if (this.Y > 63){ this.Y = 0; }
        if (this.X > 87){ this.X = 0; }
        if (this.Y < 0){ this.Y = 63; }
        if (this.X < 0){ this.X = 87; }

        this.worldIndex = this.X + (this.Y * 88);
    }

    moveRegion(dir) {
        this.lastx = this.x;
        this.lasty = this.y;
        switch (dir) {
            case 'up': this.y--; break;
            case 'right': this.x++; break;
            case 'down': this.y++; break;
            case 'left': this.x--; break;
        }
        this.regionIndex = this.x + (this.y * 88);
    }

    moveBack(world) {
        if (world) {
            this.X = this.lastX;
            this.Y = this.lastY;
            this.worldIndex = this.X + (this.Y * 88);
        } else {
            this.x = this.lastx;
            this.y = this.lasty;
            this.regionIndex = this.x + (this.y * 88);
        }
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