class SciFi {
    VOWELS = "aeiouy".split('');
    CONSONANTS = "bcdfghjklmnpqrstvwxz".split('');
    SYLLABLES = []
    STEPS_PER_DAY = 600
    constructor() {
        for (let i = 0; i < this.CONSONANTS.length; i++) {
            for (let j = 0; j < this.VOWELS.length; j++) {
                this.SYLLABLES.push(this.CONSONANTS[i] + this.VOWELS[j])
            }
        }
    }

    generateSciFiName(syllables = 3) {
        let retStr = ''
        for (let i = 0; i < syllables; i++) {
            retStr += this.SYLLABLES[Math.floor(Math.random() * this.SYLLABLES.length)]
        }
        return retStr
    }

    convertStepsToTimeString(steps) {
        let daysPassed = Math.floor(steps / this.STEPS_PER_DAY) + 1;
        let monthsPassed = Math.floor(daysPassed / 30) + 1;
        let yearsPassed = Math.floor(monthsPassed / 360) + 2500;

        let hours = steps % this.STEPS_PER_DAY;

        return `${yearsPassed}-${monthsPassed}-${daysPassed} Time: ${hours}`;
    }
}

module.exports = SciFi;