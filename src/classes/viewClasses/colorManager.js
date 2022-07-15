class ColorManager {

    constructor() { }

    getColorForWorldTile(region) {

        let redChan = 0;
        let greChan = 0;
        let bluChan = 0;
        let alpChan = 1;

        if (region.elevation == 0 && region.temperature > 32) {
            redChan = 3;
            greChan = 15;
            bluChan = 20;
        } else {
            redChan = this.decimalTo255(region.elevation);
            greChan = this.decimalTo255(region.elevation);
            bluChan = this.decimalTo255(region.elevation);
        }

        if (region.temperature > 70) {
            redChan += 5;
        } else if (region.temperature < 32) {
            bluChan += 5;
        } else {
            greChan += 5;
        }

        //latitude
        bluChan = Math.floor(redChan + region.latitude)

        // //=> fog of war
        // if (!region.discovered) {    
        //     redChan = Math.floor(redChan / 5);
        //     greChan = Math.floor(greChan / 5);
        //     bluChan = Math.floor(bluChan / 5);
        // }

        return `rgba(${redChan}, ${greChan}, ${bluChan}, ${alpChan})`;
    }

    getColorForRegionTile(tile) {

        if (tile.wall == 1) {
            return 'rgba(10, 10, 10, 1)';
        }

        let redChan = 0;
        let greChan = 0;
        let bluChan = 0;
        let alpChan = 1;

        redChan = this.decimalTo255(tile.lightLevel);
        greChan = this.decimalTo255(tile.lightLevel);
        bluChan = this.decimalTo255(tile.lightLevel);

        if (Math.random() > 0.9) {
            redChan += 3;
        }
        if (Math.random() > 0.9) {
            greChan += 3;
        }
        if (Math.random() > 0.9) {
            bluChan += 3;
        }

        return `rgba(${redChan}, ${greChan}, ${bluChan}, ${alpChan})`;
    }

    decimalTo255(int) {
        return Math.floor(int * 12.5) + 30
    }
}

module.exports = ColorManager