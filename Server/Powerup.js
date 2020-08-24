const Rect = require('./Rect.js');
const Constants = require('../Constants.js')
//класс лекарства
class Powerup extends Rect {
    constructor(x, y, w, h, type, data,duration) {
        super(x, y, w, h);
        this.type = type;
        this.data = data;
        this.exist = true;
        this.expirationTime = 0;
        this.duration = duration;
    }

    static create() {
        const x = Math.random() * Constants.WORLD_WIDTH;
        const y = Math.random() * Constants.WORLD_HEIGHT;
        const w = Constants.POWERUP_WIDTH;
        const h = Constants.POWERUP_WIDTH;
        const type = Constants.POWERUP_TYPES[Math.floor(Math.random() * Constants.POWERUP_TYPES.length)];
        let data = null;
        let duration = null;
        switch (type) {
            case Constants.POWERUP_PILL_TYPE:
                data = Constants.POWERUP_PILL_HEALTH;
                duration = 0;
                break;
            case Constants.POWERUP_MASK_TYPE:
                data = Constants.POWERUP_MASK_MULTIPLIER;
                duration = Constants.POWERUP_MASK_DURATION;
                break;
        }
        return new Powerup(x, y, w, h, type, data, duration);
    }

    isExist() {
        return this.exist;
    }

    pickUp(currentTime) {
        this.exist = false;
        this.expirationTime = currentTime + this.duration;
    }
}
module.exports = Powerup;