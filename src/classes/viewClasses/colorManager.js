class ColorManager {

    constructor() { }

    getColorForWorldTile(region) {

        let redChan = 0;
        let greChan = 0;
        let bluChan = 0;
        let alpChan = 1;

        if (region.elevation == 0 && region.temperature > 32) {
            redChan = 7;
            greChan = 30;
            bluChan = 40;
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

        // if (!region.discovered) {    
        //     redChan = Math.floor(redChan / 5);
        //     greChan = Math.floor(greChan / 5);
        //     bluChan = Math.floor(bluChan / 5);
        // }

        return `rgba(${redChan}, ${greChan}, ${bluChan}, ${alpChan})`;
    }

    getColorForRegionTile(tile) {
        let redChan = 0;
        let greChan = 0;
        let bluChan = 0;
        let alpChan = 1;

        if (tile.wall == 0) {
            return 'rgba(14, 72, 77, 1)';
        }

        redChan = this.decimalTo255(1);
        greChan = this.decimalTo255(1);
        bluChan = this.decimalTo255(1);

        return `rgba(${redChan}, ${greChan}, ${bluChan}, ${alpChan})`;
    }

    decimalTo255(int) {
        return Math.floor(int * 12.5) + 30
    }
}

module.exports = ColorManager