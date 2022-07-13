class ColorManager {

    constructor() { }

    getColorForWorldTile(region) {
        let redChan = 0;
        let greChan = 0;
        let bluChan = 0;
        let alpChan = 1;

        if (region.elevation == 0) {
            return 'rgba(14, 72, 77, 1)';
        }

        redChan = this.decimalTo255(region.elevation);
        greChan = this.decimalTo255(region.elevation);
        bluChan = this.decimalTo255(region.elevation);

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

    //1,2,3,4, 5, 6, 7, 8, 9,10,
    //2,4,6,8,10,12,14,16,18,20,
    //2,4,6,8, a, b, c, d, e, f,
    decimalToHex(int) {

        int *= 2
        switch (int) {
            case 10: return 'a'
            case 12: return 'b'
            case 14: return 'c'
            case 16: return 'd'
            case 18: return 'e'
            case 20: return 'f'
        }
        return int;
    }

    decimalTo255(int) {
        return Math.floor(int * 25.5)
    }
}

module.exports = ColorManager