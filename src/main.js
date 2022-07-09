//#region [rgba(0,0,255,0.15)] IMPORTS AND CONSTANTS

const fs = require('fs');
const cnv = document.querySelector('#canvas');
const log = document.querySelector('#admin-log');
cnv.width = 1408;
cnv.height = 1024;
const ctx = cnv.getContext("2d");
console.log(ctx);
const PIXEL_WIDTH = 16;

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
    x;
    y;
    i;
    constructor(x, y, i) {
        this.x = x;
        this.y = y;
        this.i = i;
    }
}

class Tile {
    x;
    y;
    i;
    constructor(x, y, i) {
        this.x = x;
        this.y = y;
        this.i = i;
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
    addLog(e.clientX + " " + e.clientY)
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

//#region [rgba(255,125,0,0.15)] LOAD WORLD

let world = {};
console.log('loading world...');
fs.readFile('./assets/world.json', "utf-8", (err, data) => {
    if (err) {
        console.log(err);
        return;
    }
    world = JSON.parse(data);

    if (!world.name) {
        world = new World();
    }

    //start loop here
    console.log('world loaded');
    gameLoop();
})

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