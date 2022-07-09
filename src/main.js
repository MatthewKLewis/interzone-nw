//#region [rgba(0,0,255,0.15)] IMPORTS, CONSTANTS, GLOBAL STATE, UTILITY
const fs = require('fs');
const cnv = document.querySelector('#canvas');

const mainMenu = document.querySelector('#main-menu');

const proximityTab = document.querySelector('#proximity-tab');
const inventoryTab = document.querySelector('#inventory-tab');
const journalTab = document.querySelector('#journal-tab');
const characterTab = document.querySelector('#character-tab');

const proximityMenu = document.querySelector('#proximity');
const inventoryMenu = document.querySelector('#inventory');
const journalMenu = document.querySelector('#journal');
const characterMenu = document.querySelector('#character');

//proximity
const timer = document.querySelector('#timer');
const lookDisplay = document.querySelector('#look');

//character
const playerNameDisplay = document.querySelector('#player-name');

const log = document.querySelector('#admin-log');

cnv.width = 1408;
cnv.height = 1024;
const ctx = cnv.getContext("2d");
console.log(ctx);
const PIXEL_WIDTH = 16;

const VOWELS = "aeiouy".split('');
const CONSONANTS = "bcdfghjklmnpqrstvwxz".split('');
let SYLLABLES = []
for (let i = 0; i < CONSONANTS.length; i++) {
    for (let j = 0; j < VOWELS.length; j++) {
        SYLLABLES.push(CONSONANTS[i] + VOWELS[j])
    }
}

let paused = true;
let worldMap = true; // as opposed to region map
let time = 0;
let world = {};
let currentRegion = {};
let player = {};

let mouseoverRegion = {};
let mouseoverTile = {};

function generateSciFiName(syllables = 3) {
    let retStr = ''
    for (let i = 0; i < syllables; i++) {
        retStr += SYLLABLES[Math.floor(Math.random() * SYLLABLES.length)]
    }
    return retStr
}
//#endregion

//#region [rgba(0,255,0,0.15)] ADMIN LOG

let logItems = [];
function addLog(text) {
    let el = document.createElement('p');
    el.innerText = text
    el.classList.add('yellow-bkg')
    if (log.childNodes.length > 10) {
        log.removeChild(log.firstChild);
    }
    log.appendChild(el);
}

//#endregion

//#region [rgba(255,0,0,0.15)] CLASSES

class World {
    regions = [];
    constructor(regions = []) {
        if (regions.length > 0) {
            console.log("loading existing world")
            this.regions = regions;
        } else {
            console.log("creating new world")
            this.initialNoise();
            this.smooth(3);
            this.zigguratize();
            this.addElevationNoise();
        }
    }

    initialNoise() {
        for (let y = 0; y < (cnv.height / PIXEL_WIDTH); y++) {
            for (let x = 0; x < (cnv.width / PIXEL_WIDTH); x++) {
                this.regions.push(new Region(x, y, Math.random() > 0.42 ? 1 : 0))
            }
        }
    }

    smooth(iterations = 1) {
        for (let i = 0; i < iterations; i++) {
            for (let i = 0; i < this.regions.length; i++) {
                const neighboringRegions = this.getNeighboringRegions(i);
                let totalSum = 0
                let lengthNonNull = 0
                for (let i = 0; i < neighboringRegions.length; i++) {
                    if (neighboringRegions[i]) {
                        totalSum += neighboringRegions[i].elevation;
                        lengthNonNull++;
                    }
                }
                if (totalSum == 3 || totalSum == 4) {
                    this.regions[i].elevation = 1;
                }
                if (totalSum == 1 || totalSum == 0) {
                    this.regions[i].elevation = 0;
                }
            }
        }
    }

    zigguratize(iterations = 9) {
        for (let currentLevel = 0; currentLevel < iterations; currentLevel++) {

            for (let i = 0; i < this.regions.length; i++) {
                const neighboringRegions = this.getNeighboringRegions(i);
                let raise = true;
                for (let j = 0; j < neighboringRegions.length; j++) {
                    if (neighboringRegions[j] && neighboringRegions[j].elevation <= currentLevel) {
                        raise = false;
                    }
                }
                if (raise) { this.regions[i].elevation = (this.regions[i].elevation + 1) }
            }

        }
    }

    addElevationNoise() {
        for (let i = 0; i < this.regions.length; i++) {
            if (this.regions[i].elevation != 0 && this.regions[i].elevation != 9) {
                Math.random() > 0.8 ? this.regions[i].elevation++ : null
            }
        }
    }

    //Utils:

    getRegionAtMouse(x, y) {
        let tileX = Math.floor(x / 16)
        let tileY = Math.floor(y / 16)
        return this.regions[tileX + (tileY * 88)]
    }

    getNeighboringRegions(regionIndex) {
        let neiReg = []
        neiReg[0] = this.regions[regionIndex - 88] || null; //NORTH
        neiReg[1] = this.regions[regionIndex + 1] || null; //EAST
        neiReg[2] = this.regions[regionIndex + 88] || null; //SOUTH
        neiReg[3] = this.regions[regionIndex - 1] || null; //WEST
        return neiReg;
    }

}

class Region {
    tiles = [];
    constructor(x, y, elevation) {
        this.name = generateSciFiName(3);
        this.x = x;
        this.y = y;
        this.index = x + (y * 88)
        this.elevation = elevation;
        this.latitude = Math.abs(32 - y); //range from 1 to 32
        this.temperature = 99 - (this.latitude * 2.5) - (this.elevation * 10);
    }

    getTileAtMouse(x, y) {
        let tileX = Math.floor(x / 16)
        let tileY = Math.floor(y / 16)
        return this.tiles[tileX + (tileY * 88)]
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

cnv.addEventListener('click', (e) => {
    let pointerX = e.clientX - e.target.offsetLeft;
    let pointerY = e.clientY - e.target.offsetTop;

    let tileX = Math.floor(pointerX / 16)
    let tileY = Math.floor(pointerY / 16)
    addLog(tileX + ":" + tileY);
})

cnv.addEventListener('mousemove', (e) => {
    let pointerX = e.clientX - e.target.offsetLeft;
    let pointerY = e.clientY - e.target.offsetTop;

    if (worldMap) {
        mouseoverRegion = world.getRegionAtMouse(pointerX, pointerY);
        lookDisplay.innerText =
            mouseoverRegion.name + '\n' +
            mouseoverRegion.elevation + '00 ft \n' +
            mouseoverRegion.temperature + '° Fahrenheit \n' +
            mouseoverRegion.latitude + `' Latitude \n`

    } else {
        mouseoverTile = currentRegion.getTileAtMouse(pointerX, pointerY);
    }

    let tileX = Math.floor(pointerX / 16)
    let tileY = Math.floor(pointerY / 16)
    addLog("mouse:" + tileX + ":" + tileY);

})

document.addEventListener('keydown', (e) => {
    console.log('player acts')
    switch (e.key) {
        case 'w':
            addLog('move up')
            player.y--;
            break;
        case 'a':
            addLog('move left')
            player.x--;
            break;
        case 's':
            addLog('move down')
            player.y++;
            break;
        case 'd':
            addLog('move right')
            player.x++;
            break;
        case 'Escape':
            quit();
            break;
        default:
            break;
    }
    gameLoop();
})

//#endregion

//#region [rgba(255,125,0,0.15)] MENUS
function newGame() {
    world = new World();
    player = new Player('Matthew', 0, 0, true);
    toggleMainMenu()
    gameLoop();
}

function continueGame() {
    fs.readFile('./assets/world.json', "utf-8", (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        world = new World(JSON.parse(data).regions);
        player = new Player('Matthew', 0, 0, true);
        toggleMainMenu()
        gameLoop();
    })
}

function quit() {
    fs.writeFile('./assets/world.json', JSON.stringify(world), err => {
        if (err) { nw.App.quit(); }
        nw.App.quit();
    });
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

function changePlayerMenuTo(newMenu) {
    proximityMenu.classList.add('hide');
    inventoryMenu.classList.add('hide');
    journalMenu.classList.add('hide');
    characterMenu.classList.add('hide');
    proximityTab.classList.remove('active');
    inventoryTab.classList.remove('active');
    journalTab.classList.remove('active');
    characterTab.classList.remove('active');
    switch (newMenu) {
        case 'proximity':
            proximityMenu.classList.remove('hide');
            proximityTab.classList.add('active');
            break;
        case 'inventory':
            inventoryMenu.classList.remove('hide');
            inventoryTab.classList.add('active');
            break;
        case 'journal':
            journalMenu.classList.remove('hide');
            journalTab.classList.add('active');
            break;
        case 'character':
            characterMenu.classList.remove('hide');
            characterTab.classList.add('active');
            break;
    }
}

//#endregion

//#region [rgba(0,125,255,0.15)] RENDERING
function render() {
    drawMenus();
    drawCanvas();
}

function drawMenus() {
    timer.innerText = time;
}

function drawCanvas() {
    for (let i = 0; i < world.regions.length; i++) {
        //world
        ctx.fillStyle = "#" + world.regions[i].elevation + world.regions[i].elevation + world.regions[i].elevation;

        switch (world.regions[i].elevation) {
            case 0:
                ctx.fillStyle = 'darkblue';
                break;
        }

        ctx.fillRect(world.regions[i].x * PIXEL_WIDTH, world.regions[i].y * PIXEL_WIDTH, PIXEL_WIDTH, PIXEL_WIDTH);

        //player
        ctx.fillStyle = 'red';
        ctx.fillRect(player.x * PIXEL_WIDTH, player.y * PIXEL_WIDTH, PIXEL_WIDTH, PIXEL_WIDTH)
    }
}
//#endregion

function gameLoop() {
    console.log('world acts')
    time++;
    render();
}