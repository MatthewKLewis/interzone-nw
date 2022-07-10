//#region [rgba(0,0,255,0.15)] IMPORTS, DOM, CONSTANTS, GLOBAL STATE, UTILITY
const fs = require('fs');

const SciFi = require('./classes/scifi');
const Player = require('./classes/player');
const Logger = require('./classes/logger');
const Region = require('./classes/region');
const World = require('./classes/world');

//Util Classes
const sciFiUtility = new SciFi();
const logger = new Logger(document.querySelector('#admin-log'))

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
const underFootDisplay = document.querySelector('#under-foot');

//character
const playerNameDisplay = document.querySelector('#player-name');

cnv.width = 1408;
cnv.height = 1024;
const ctx = cnv.getContext("2d");
const PIXEL_WIDTH = 16;

let paused = true;
let worldMap = true; // as opposed to region map
let time = 0;
let world = {};
let currentRegion = {};
let player = {};

let mouseoverRegion = {};

//#endregion

//#region [rgba(255,0,125,0.15)] INPUTS

cnv.addEventListener('click', (e) => {
    let pointerX = e.clientX - e.target.offsetLeft;
    let pointerY = e.clientY - e.target.offsetTop;
    let tileX = Math.floor(pointerX / 16)
    let tileY = Math.floor(pointerY / 16)
    logger.addLog(tileX + ":" + tileY);
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
})

document.addEventListener('keydown', (e) => {
    //console.log('player acts')
    switch (e.key) {
        case 'w':
            //logger.addLog('move up')
            player.move('up');
            advanceTime(worldMap ? sciFiUtility.STEPS_PER_DAY : 1);
            break;
        case 'd':
            //logger.addLog('move right')
            player.move('right');
            advanceTime(worldMap ? sciFiUtility.STEPS_PER_DAY : 1);
            break;
        case 's':
            //logger.addLog('move down')
            player.move('down');
            advanceTime(worldMap ? sciFiUtility.STEPS_PER_DAY : 1);
            break;
        case 'a':
            //logger.addLog('move left')
            player.move('left');
            advanceTime(worldMap ? sciFiUtility.STEPS_PER_DAY : 1);
            break;
        case 'q':
            worldMap ? descendToRegion() : ascendToWorldMap()
            break;
        case 'Escape':
            quit();
            break;
        default:
            break;
    }
})

//#endregion

//#region [rgba(255,125,0,0.15)] MENUS
function newGame() {
    world = new World();
    player = new Player('Matthew', 0, 0, true);
    toggleMainMenu()
    advanceTime();
    logger.addLog("Welcome to World")
}

function continueGame() {
    fs.readFile('./assets/world/world.json', "utf-8", (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        world = new World(JSON.parse(data).regions);
        player = new Player('Matthew', 0, 0, true);
        toggleMainMenu()
        advanceTime();
    })
    logger.addLog("Welcome to World")
}

function descendToRegion() {
    logger.addLog("moving down to region at " + player.index)
    player.saveWorldPosition();
    player.x = 0;
    player.y = 0;
    if (fs.existsSync(`./assets/world/region${player.index}.json`)) {
        logger.addLog("file exists")
        fs.readFile(`./assets/world/region${player.index}.json`, "utf-8", (err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            currentRegion = new Region(null, JSON.parse(data));
            worldMap = false;
            advanceTime();
        })
    } 
    else {
        logger.addLog("file doesn't exist")
        currentRegion = new Region(world.regions[player.index], null)
        worldMap = false;
        advanceTime();
    }
}

function ascendToWorldMap() {
    logger.addLog("moving up to world map")
    player.moveToLastWorldPosition();
    currentRegion = {};
    worldMap = true;
    advanceTime();
}

function quit() {
    fs.writeFile('./assets/world/world.json', JSON.stringify(world), err => {
        if (err) {
            //error condition
        }
        nw.App.quit();
    });
}

//css hides and reveals
function toggleMainMenu() {
    if (paused) {
        //console.log('showing mm');
        mainMenu.classList.add('hide')
    } else {
        //console.log('hiding mm');
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
    timer.innerText = sciFiUtility.convertStepsToTimeString(time);

    if (world) {
        underFootDisplay.innerText =
            world.regions[player.index].name + '(' + player.index + ')' + '\n' +
            world.regions[player.index].elevation + '00 ft \n' +
            world.regions[player.index].temperature + '° Fahrenheit \n' +
            world.regions[player.index].latitude + `' Latitude \n`
    }

}

function drawCanvas() {
    if (worldMap) {
        for (let i = 0; i < world.regions.length; i++) {
            //world
            ctx.fillStyle = "#" + world.regions[i].elevation + world.regions[i].elevation + world.regions[i].elevation;

            switch (world.regions[i].elevation) {
                case 0:
                    ctx.fillStyle = 'darkblue';
                    break;
            }

            if (world.regions[i].elevation > 9) ctx.fillStyle = 'white';

            ctx.fillRect(world.regions[i].x * PIXEL_WIDTH, world.regions[i].y * PIXEL_WIDTH, PIXEL_WIDTH, PIXEL_WIDTH);

            //player
            ctx.fillStyle = 'red';
            ctx.fillRect(player.x * PIXEL_WIDTH, player.y * PIXEL_WIDTH, PIXEL_WIDTH, PIXEL_WIDTH)
        }
    }
    else { //regionMap
        for (let i = 0; i < currentRegion.tiles.length; i++) {
            //region
            ctx.fillStyle = currentRegion.tiles[i].wall == 1 ? 'white' : 'lightgrey';
            ctx.fillRect(currentRegion.tiles[i].x * PIXEL_WIDTH, currentRegion.tiles[i].y * PIXEL_WIDTH, PIXEL_WIDTH, PIXEL_WIDTH);

            //player
            ctx.fillStyle = 'red';
            ctx.fillRect(player.x * PIXEL_WIDTH, player.y * PIXEL_WIDTH, PIXEL_WIDTH, PIXEL_WIDTH)
        }
    }

}

//#endregion

function advanceTime(jumpTime = 1) {
    //console.log('world acts')
    time += jumpTime;
    render();
}