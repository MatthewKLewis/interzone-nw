//#region [rgba(0,0,255,0.15)] DEPENDENCIES
const fs = require('fs');

const SciFi = require('./classes/scifi');
const Player = require('./classes/player');
const Logger = require('./classes/logger');
const Modaler = require('./classes/modal');
const Region = require('./classes/region');
const World = require('./classes/world');
const ImageManager = require('./classes/imageManager');
const Defaults = require('./classes/defaults')

//Util Classes
const d = new Defaults();
const sciFiUtility = new SciFi();
const logger = new Logger(document.querySelector('#admin-log'))
const modaler = new Modaler(document.querySelector('#modal'))
const imageManager = new ImageManager();

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
const healthbarDisplay = document.querySelector('#healthbar');
const experienceDisplay = document.querySelector('#experience');

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

let actors = [];

let mouseoverRegion = {};

//#endregion

//#region [rgba(255,0,125,0.15)] CONTROLLER

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
    if (worldMap) {
        switch (e.key) {
            case 'w':
                //logger.addLog('move up')
                player.moveWorld('up');
                advanceTime(sciFiUtility.STEPS_PER_DAY);
                break;
            case 'd':
                //logger.addLog('move right')
                player.moveWorld('right');
                advanceTime(sciFiUtility.STEPS_PER_DAY);
                break;
            case 's':
                //logger.addLog('move down')
                player.moveWorld('down');
                advanceTime(sciFiUtility.STEPS_PER_DAY);
                break;
            case 'a':
                //logger.addLog('move left')
                player.moveWorld('left');
                advanceTime(sciFiUtility.STEPS_PER_DAY);
                break;
            case 'q':
                descendToRegion();
                break;
            case 'm':
                modaler.toggleVisibility()
                break;
            case 'Escape':
                quit();
                break;
            default:
                break;
        }
    }
    else { //regionMap
        switch (e.key) {
            case 'w':
                //logger.addLog('move up')
                player.moveRegion('up');
                advanceTime(1);
                break;
            case 'd':
                //logger.addLog('move right')
                player.moveRegion('right');
                advanceTime(1);
                break;
            case 's':
                //logger.addLog('move down')
                player.moveRegion('down');
                advanceTime(1);
                break;
            case 'a':
                //logger.addLog('move left')
                player.moveRegion('left');
                advanceTime(1);
                break;
            case 'q':
                ascendToWorldMap();
                break;
            case 'm':
                modaler.toggleVisibility()
                break;
            case 'Escape':
                quit();
                break;
            default:
                break;
        }
    }

})

//#endregion

//#region [rgba(255,125,0,0.15)] MODEL
function worldActs() {
    if (worldMap) {
        //logger.addLog("WM - Player moved into square with: " + world.regions[player.worldIndex].elevation + " elevation")
        if (world.regions[player.worldIndex].elevation == 0) {
            logger.addLog("Can't move into the ocean without a raft!")
            player.moveBack(true);
        }
    }
    else { //regionMap
        //logger.addLog("RM - Player moved into square with: " + currentRegion.tiles[player.regionIndex].wall + " wall")
        if (currentRegion.tiles[player.regionIndex].wall) {
            logger.addLog("BUMP!")
            player.moveBack(false);
        }
    }
}

function newGame() {
    world = new World();

    let xy = world.findAppropriateStartingLocationForPlayer();
    let startingPlayerDefaults = d.PLAYER;
    startingPlayerDefaults.X = xy[0];
    startingPlayerDefaults.Y = xy[1];

    player = new Player(startingPlayerDefaults);
    toggleMainMenu()
    advanceTime();
    logger.addLog("Welcome to World")
}

function continueGame() {
    fs.readFile('./assets/world/world.json', "utf-8", (err, worldData) => {
        if (err) {
            console.log(err);
            return;
        }
        world = new World(JSON.parse(worldData).regions);
        fs.readFile('./assets/player/player.json', "utf-8", (err, playerData) => {
            if (err) {
                console.log(err);
                return;
            }
            player = new Player(JSON.parse(playerData));
            toggleMainMenu()
            advanceTime();
        })
    })
    logger.addLog("Welcome to World")
}

function descendToRegion() {
    logger.addLog("moving down to region at " + player.worldIndex)
    player.x = 0;
    player.y = 0;
    if (fs.existsSync(`./assets/world/region${player.worldIndex}.json`)) {
        logger.addLog("file exists")
        fs.readFile(`./assets/world/region${player.worldIndex}.json`, "utf-8", (err, data) => {
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
        currentRegion = new Region(world.regions[player.worldIndex], null)
        worldMap = false;
        advanceTime();
    }
}

function ascendToWorldMap() {
    logger.addLog("moving up to world map")
    currentRegion = {};
    worldMap = true;
    advanceTime();
}

function quit() {
    player.savePlayer();
    world.saveWorld();
    nw.App.quit();
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

//#region [rgba(0,125,255,0.15)] VIEW
function render() {
    drawMenus();
    drawWorldOrRegion();
    drawActors();
    drawPlayer();
}

function drawMenus() {
    timer.innerText = sciFiUtility.convertStepsToTimeString(time);
    playerNameDisplay.innerText = player.name;
    healthbarDisplay.value = player.health;
    healthbarDisplay.max = player.maxHealth;
    experienceDisplay.value = player.experience;
    experienceDisplay.max = 100;

    if (world) {
        underFootDisplay.innerText =
            world.regions[player.worldIndex].name + '(' + player.worldIndex + ')' + '\n' +
            world.regions[player.worldIndex].elevation + '00 ft \n' +
            world.regions[player.worldIndex].temperature + '° Fahrenheit \n' +
            world.regions[player.worldIndex].latitude + `' Latitude \n`
    }

}

function drawWorldOrRegion() {
    if (worldMap) {
        for (let i = 0; i < world.regions.length; i++) {
            //world
            if (world.regions[i].tileUrl) {
                ctx.drawImage(imageManager.images.get(world.regions[i].tileUrl), 
                    world.regions[i].x * PIXEL_WIDTH, 
                    world.regions[i].y * PIXEL_WIDTH)
            }
            else {
                ctx.fillStyle = "#" + world.regions[i].elevation + world.regions[i].elevation + world.regions[i].elevation;
                switch (world.regions[i].elevation) {
                    case 0:
                        ctx.fillStyle = 'darkblue';
                        break;
                }
                if (world.regions[i].elevation > 9) ctx.fillStyle = 'white';
                ctx.fillRect(world.regions[i].x * PIXEL_WIDTH, world.regions[i].y * PIXEL_WIDTH, PIXEL_WIDTH, PIXEL_WIDTH);
            }
        }
    }
    else { //regionMap
        for (let i = 0; i < currentRegion.tiles.length; i++) {
            if (currentRegion.tiles[i].tileUrl) {
                ctx.drawImage(imageManager.images.get(currentRegion.tiles[i].tileUrl), 
                    currentRegion.tiles[i].x * PIXEL_WIDTH, 
                    currentRegion.tiles[i].y * PIXEL_WIDTH)
            }
            else {
                ctx.fillStyle = currentRegion.tiles[i].wall == 1 ? 'white' : 'lightgrey';
                ctx.fillRect(currentRegion.tiles[i].x * PIXEL_WIDTH, currentRegion.tiles[i].y * PIXEL_WIDTH, PIXEL_WIDTH, PIXEL_WIDTH);
            }
        }
    }
}

function drawActors() {
    //
}

function drawPlayer() {
    //player
    if (worldMap) {
        ctx.drawImage(imageManager.images.get('player.png'), player.X * PIXEL_WIDTH, player.Y * PIXEL_WIDTH)
    }
    else { //regionMap
        ctx.drawImage(imageManager.images.get('player.png'), player.x * PIXEL_WIDTH, player.y * PIXEL_WIDTH)
    }
}

//#endregion

function advanceTime(jumpTime = 1) {
    worldActs();
    time += jumpTime;
    render();
}