class SciFi {
    VOWELS = "aeiouy".split('');
    CONSONANTS = "bcdfghjklmnpqrstvwxz".split('');
    SYLLABLES = []
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
}

module.exports = SciFi;