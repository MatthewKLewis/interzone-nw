//#region [rgba(0,0,255,0.15)] IMPORTS, CONSTANTS, GLOBAL STATE

const fs = require('fs');
const cnv = document.querySelector('#canvas');
const log = document.querySelector('#admin-log');
const mainMenu = document.querySelector('#main-menu');
cnv.width = 1408;
cnv.height = 1024;
const ctx = cnv.getContext("2d");
console.log(ctx);
const PIXEL_WIDTH = 16;

let paused = true;
let time = 0;
let world = {};

//#endregion

//#region [rgba(0,255,0,0.15)] ADMIN LOG

let logItems = [];
function addLog(text) {
    let el = document.createElement('p');
    el.innerText = text
    el.classList.add('yellow-bkg')
    log.appendChild(el);
}

//#endregion

//#region [rgba(255,0,0,0.15)] CLASSES

class World {
    name = "Urth";
    regions = [];
    constructor() {
        for (let x = 0; x < (cnv.width / PIXEL_WIDTH); x++) {
            for (let y = 0; y < (cnv.height / PIXEL_WIDTH); y++) {
                this.regions.push(new Region(x, y, Math.random() > 0.5 ? 1 : 0))
            }
        }
    }
}

class Region {
    name = "reg"
    constructor(x, y, i) {
        this.x = x;
        this.y = y;
        this.i = i;
    }
}

class Tile {
    constructor(x, y, i) {
        this.x = x;
        this.y = y;
        this.i = i;
    }
}

class Actor {
    constructor(name, x, y, alive) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.alive = alive;
    }
}

class Player extends Actor {
    constructor(name, x, y, alive, playerName) {
        super(name, x, y, alive);
        this.playerName = playerName;
    }
}
//#endregion

//#region [rgba(255,0,125,0.15)] INPUTS

function quit() {
    fs.writeFile('./assets/world.json', JSON.stringify(world), err => {
        if (err) {nw.App.quit();}
        nw.App.quit();
    });
}

cnv.addEventListener('click', (e)=>{
    console.log(e);
    let pointerX = e.clientX - e.target.offsetLeft;
    let pointerY = e.clientY - e.target.offsetTop;

    let tileX = Math.floor(pointerX / 16)
    let tileY = Math.floor(pointerY / 16)
    addLog(tileX + ":" + tileY);
})

document.addEventListener('keydown', (e) => {
    //console.log(e);
    switch (e.key) {
        case 'w':
            addLog('move up')
            break;
        case 'a':
            addLog('move left')
            break;
        case 's':
            addLog('move right')
            break;
        case 'd':
            addLog('move down')
            break;
        case 'Escape':
            quit();
            break;
        default:
            break;
    }
})

//#endregion

//#region [rgba(255,125,0,0.15)] MAIN MENU
function newGame() {
    world = new World();
    toggleMainMenu()
    gameLoop();
}

function continueGame() {
    fs.readFile('./assets/world.json', "utf-8", (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        world = JSON.parse(data);
        toggleMainMenu()
        gameLoop();
    })
}

function toggleMainMenu() {
    if (paused) {
        console.log('showing mm');
        mainMenu.classList.add('hide')
    } else {
        console.log('hiding mm');
        mainMenu.classList.remove('hide')
    }
}

//#endregion

function gameLoop() {
    console.log('start loop!')
    for (let i = 0; i < world.regions.length; i++) {
        ctx.fillStyle = world.regions[i].i == 0 ? 'black' : 'white';
        if (i == world.regions.length - 1) ctx.fillStyle = 'red';
        ctx.fillRect(world.regions[i].x * PIXEL_WIDTH, world.regions[i].y * PIXEL_WIDTH, PIXEL_WIDTH, PIXEL_WIDTH);
    }
    console.log('end loop!')
}