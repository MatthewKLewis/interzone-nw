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
            this.smooth()
        }
    }

    initialNoise() {
        for (let x = 0; x < (cnv.width / PIXEL_WIDTH); x++) {
            for (let y = 0; y < (cnv.height / PIXEL_WIDTH); y++) {
                this.regions.push(new Region(x, y, Math.floor(Math.random() * 10)))
            }
        }
    }

    smooth() {
        console.log("neighbors:")
        console.log(this.getNeighboringRegions(0))

        for (let i = 0; i < this.regions.length; i++) {
            let neighboringRegions = this.getNeighboringRegions(i);
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
        neiReg[1] = this.regions[regionIndex + 1 ] || null; //EAST
        neiReg[2] = this.regions[regionIndex + 88] || null; //SOUTH
        neiReg[3] = this.regions[regionIndex - 1 ] || null; //WEST
        return neiReg;
    }

}

class Region {
    tiles = [];
    constructor(x, y, elevation) {
        this.name = generateSciFiName(3);
        this.x = x;
        this.y = y;
        this.elevation = elevation;
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

cnv.addEventListener('click', (e)=>{
    let pointerX = e.clientX - e.target.offsetLeft;
    let pointerY = e.clientY - e.target.offsetTop;

    let tileX = Math.floor(pointerX / 16)
    let tileY = Math.floor(pointerY / 16)
    addLog(tileX + ":" + tileY);
})

cnv.addEventListener('mousemove', (e)=>{
    let pointerX = e.clientX - e.target.offsetLeft;
    let pointerY = e.clientY - e.target.offsetTop;

    if (worldMap) {
        mouseoverRegion = world.getRegionAtMouse(pointerX, pointerY);
        lookDisplay.innerText = mouseoverRegion.name;
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
        if (err) {nw.App.quit();}
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
            case 1:
                ctx.fillStyle = 'blue'                
                break;        
            case 2:                
                break;        
            case 3:                
                break;        
            case 4:                
                break;        
            case 5:                
                break;        
            case 6:                
                break;        
            case 7:
                break;
            case 8:             
                break;
            case 9:        
            ctx.fillStyle = 'white'         
                break;
            default:
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