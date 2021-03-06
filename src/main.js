//#region [rgba(0,0,255,0.15)] DEPENDENCIES
const fs = require('fs');
const SciFi = require('./classes/scifi');
const Defaults = require('./classes/defaults')
const Player = require('./classes/actors/player');
const World = require('./classes/geographic/world');
const Region = require('./classes/geographic/region');
const Logger = require('./classes/viewClasses/logger');
const Modaler = require('./classes/viewClasses/modal');
const ColorManager = require('./classes/viewClasses/colorManager');
const ImageManager = require('./classes/viewClasses/imageManager');
const SoundManager = require('./classes/viewClasses/soundManager');

//Util Classes
const d = new Defaults();
const sciFiUtility = new SciFi();
const logger = new Logger(document.querySelector('#admin-log'))
const modaler = new Modaler(document.querySelector('#modal'), document.querySelector('#modal-content'))
const imageManager = new ImageManager();
const soundManager = new SoundManager();
const colorManager = new ColorManager();

//soundManager.music.get('xelpun3.mp3').play();

const cnv = document.querySelector('#canvas');
const mainMenu = document.querySelector('#main-menu');
const journalTab = document.querySelector('#journal-tab');
const proximityTab = document.querySelector('#proximity-tab');
const inventoryTab = document.querySelector('#inventory-tab');
const characterTab = document.querySelector('#character-tab');
const journalMenu = document.querySelector('#journal');
const proximityMenu = document.querySelector('#proximity');
const inventoryMenu = document.querySelector('#inventory');
const characterMenu = document.querySelector('#character');
const interactionButtonParent = document.querySelector('#interactions');

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

let npcsNearPlayer = [];
let objectsAtPlayerPosition = [];

let mouseoverRegion = {};
let pointerX = 0;
let pointerY = 0;

//#endregion

//#region [rgba(255,0,125,0.15)] CONTROLLER

cnv.addEventListener('click', (e) => {
    pointerX = e.clientX - e.target.offsetLeft;
    pointerY = e.clientY - e.target.offsetTop;

    if (worldMap) {
        mouseoverRegion = world.getRegionAtMouse(pointerX, pointerY);
        lookDisplay.innerText =
            mouseoverRegion.name + '\n' +
            mouseoverRegion.elevation + '00 ft \n' +
            mouseoverRegion.temperature + '?? Fahrenheit \n' +
            mouseoverRegion.settlement + ' Settlement Level ' + (mouseoverRegion.settlementName ? mouseoverRegion.settlementName : '') + '\n'
            mouseoverRegion.latitude + `' Latitude \n`
    }
    else { //regionMap
        mouseoverTile = currentRegion.getTileAtMouse(pointerX, pointerY);
        lookDisplay.innerText =
            mouseoverTile.wall + 'wall \n' +
            mouseoverTile.interior + 'interior \n' +
            mouseoverTile.lightLevel + `' photons \n`
    }
    render();
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
            case 'k':
                logger.addLog("KILLING THE LIGHTS")
                currentRegion.lights = [];
                advanceTime(1);
                break;
            case 'Escape':
                quit();
                break;
            default:
                break;
        }
    }

})

function openModal(panelName) {
    switch (panelName) {
        case 'pickup':
            logger.addLog("open inventory");
            modaler.open(panelName, objectsAtPlayerPosition, ()=>{
                logger.addLog("closed inventory");
            })
            break;    
        case 'dialog':
            logger.addLog("open dialog");
            modaler.open('dialog', npcsNearPlayer, ()=>{
                logger.addLog("closed dialog");
            })
            break;
        default:
            break;
    }
}

function closeModal() {
    modaler.close();
}

//#endregion

//#region [rgba(255,125,0,0.15)] MODEL
function worldActs() {
    if (worldMap) {
        //logger.addLog("WM - Player moved into square with: " + world.regions[player.worldIndex].elevation + " elevation")
        if (world.regions[player.worldIndex].elevation == 0 && world.regions[player.worldIndex].temperature > 32) {
            logger.addLog("Can't move into the ocean without a raft!")
            player.moveBack(true);
        }
        world.discoverRegionAt(player.worldIndex);
    }
    else { //regionMap
        //COLLISION
        if (currentRegion.tiles[player.regionIndex].wall) {
            logger.addLog("BUMP!")
            player.moveBack(false);
        }

        //ATTACK
        let attackedActor = currentRegion.actors.find(actor => actor.x == player.x && actor.y == player.y)
        if (attackedActor) {
            logger.addLog("Attacking..." + attackedActor.name + '!')
            player.moveBack(false);
        }

        //GAMEOBJECTS
        objectsAtPlayerPosition = currentRegion.items.filter(item => item.regionIndex == player.regionIndex);
        if (objectsAtPlayerPosition.length > 0) {
            logger.addLog("You notice something under your foot..." + objectsAtPlayerPosition[0].name + '!')
            //console.log(objectsAtPlayerPosition)
        }

        //NEARBY NPCS
        npcsNearPlayer = currentRegion.actors.filter(actor => 
            (actor.x == player.x || actor.x == player.x + 1 || actor.x == player.x - 1) && 
            (actor.y == player.y || actor.y == player.y + 1 || actor.y == player.y - 1));
        if (npcsNearPlayer.length > 0) {
            logger.addLog("You are standing near..." + npcsNearPlayer[0].name + '!')
            //console.log(npcsNearPlayer)
        }

        currentRegion.setLightLevels()

        //Enemy Movement and Attacks
        //Player Movement and Attacks
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
    logger.addLog("You enter the world.")
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
    mouseoverRegion = {}

    if (fs.existsSync(`./assets/world/region${player.worldIndex}.json`)) {
        logger.addLog("file exists")
        fs.readFile(`./assets/world/region${player.worldIndex}.json`, "utf-8", (err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            currentRegion = new Region(null, JSON.parse(data));
            player.x = currentRegion.entryPoint[0];
            player.y = currentRegion.entryPoint[1];
            worldMap = false;
            advanceTime();
        })
    }
    else {
        logger.addLog("file doesn't exist")
        currentRegion = new Region(world.regions[player.worldIndex], null)
        player.x = currentRegion.entryPoint[0];
        player.y = currentRegion.entryPoint[1];
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
        paused = false;
        mainMenu.classList.add('hide')
    } else {
        //console.log('hiding mm');
        paused = true;
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
    drawInterfaceDetails();
    drawInteractionButtons();
    drawWorldOrRegion();
    !worldMap && drawItems();
    !worldMap && drawActors();
    //mouseoverRegion && drawSelectedTile();
    drawLineFromPlayerToClick()
    drawPlayer();
}

function drawSelectedTile() {
    ctx.drawImage(imageManager.images.get('highlight.png'), mouseoverRegion.x * PIXEL_WIDTH, mouseoverRegion.y * PIXEL_WIDTH)
}

function drawLineFromPlayerToClick() {
    ctx.drawImage(imageManager.images.get('powerup.png'), pointerX - 8, pointerY - 8);
}

function drawInterfaceDetails() {
    timer.innerText = sciFiUtility.convertStepsToTimeString(time);
    playerNameDisplay.innerText = player.name;
    healthbarDisplay.value = player.health;
    healthbarDisplay.max = player.maxHealth;
    experienceDisplay.value = player.experience;
    experienceDisplay.max = 100;

    if (world) {
        underFootDisplay.innerText =
            world.regions[player.worldIndex].name + '\n' +
            world.regions[player.worldIndex].elevation + '00 ft \n' +
            world.regions[player.worldIndex].temperature + '?? Fahrenheit \n' +
            world.regions[player.worldIndex].settlement + ' Settlement Level \n' +
            world.regions[player.worldIndex].latitude + `' Latitude \n`
    }

}

function drawWorldOrRegion() {
    if (worldMap) {
        for (let i = 0; i < world.regions.length; i++) {
            ctx.fillStyle = colorManager.getColorForWorldTile(world.regions[i]);
            ctx.fillRect(world.regions[i].x * PIXEL_WIDTH, world.regions[i].y * PIXEL_WIDTH, PIXEL_WIDTH, PIXEL_WIDTH);
            
            if (world.regions[i].tileUrl) {
                ctx.drawImage(imageManager.images.get(world.regions[i].tileUrl), 
                    world.regions[i].x * PIXEL_WIDTH, 
                    world.regions[i].y * PIXEL_WIDTH)
            }            
        }
    }
    else {//regionMap
        for (let i = 0; i < currentRegion.tiles.length; i++) {
            ctx.fillStyle = colorManager.getColorForRegionTile(currentRegion.tiles[i]);
            ctx.fillRect(currentRegion.tiles[i].x * PIXEL_WIDTH, currentRegion.tiles[i].y * PIXEL_WIDTH, PIXEL_WIDTH, PIXEL_WIDTH);

            if (currentRegion.tiles[i].tileUrl) {
                ctx.drawImage(imageManager.images.get(currentRegion.tiles[i].tileUrl), 
                    currentRegion.tiles[i].x * PIXEL_WIDTH, 
                    currentRegion.tiles[i].y * PIXEL_WIDTH)
            }
        }
    }
}

function drawItems() {
    for (let i = 0; i < currentRegion.items.length; i++) {
        if (currentRegion.items[i].tileUrl) {
            ctx.drawImage(imageManager.images.get(currentRegion.items[i].tileUrl), 
                currentRegion.items[i].x * PIXEL_WIDTH, 
                currentRegion.items[i].y * PIXEL_WIDTH)
        }    
    }
    for (let i = 0; i < currentRegion.lights.length; i++) {
        if (currentRegion.lights[i].tileUrl) {
            ctx.drawImage(imageManager.images.get(currentRegion.lights[i].tileUrl), 
                currentRegion.lights[i].x * PIXEL_WIDTH, 
                currentRegion.lights[i].y * PIXEL_WIDTH)
        }    
    }
}

function drawActors() {
    for (let i = 0; i < currentRegion.actors.length; i++) {
        if (currentRegion.actors[i].tileUrl) {
            ctx.drawImage(imageManager.images.get(currentRegion.actors[i].tileUrl), 
                currentRegion.actors[i].x * PIXEL_WIDTH, 
                currentRegion.actors[i].y * PIXEL_WIDTH)
        }    
    }
}

function drawPlayer() {
    //player
    if (worldMap) {
        ctx.drawImage(imageManager.images.get('player.png'), player.X * PIXEL_WIDTH, player.Y * PIXEL_WIDTH)
    }
    else {//regionMap
        ctx.drawImage(imageManager.images.get('player.png'), player.x * PIXEL_WIDTH, player.y * PIXEL_WIDTH)
    }
}

function drawInteractionButtons() {
    while (interactionButtonParent.firstChild) {
        interactionButtonParent.removeChild(interactionButtonParent.firstChild);
    }

    let buttonEl = document.createElement('button')
    buttonEl.classList.add('interaction-button')
    if (objectsAtPlayerPosition.length > 0) {
        buttonEl.innerText = "Pick Up"
        buttonEl.addEventListener('click', ()=> {openModal('pickup')})
        interactionButtonParent.appendChild(buttonEl)
    }    

    if (npcsNearPlayer.length > 0) {
        buttonEl.innerText = "Speak"
        buttonEl.addEventListener('click', ()=> {openModal('dialog')})
        interactionButtonParent.appendChild(buttonEl)
    }
}

//#endregion

function advanceTime(jumpTime = 1) {
    worldActs();
    time += jumpTime;
    render();
}