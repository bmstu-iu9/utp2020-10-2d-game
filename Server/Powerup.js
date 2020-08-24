const Rect = require('./Rect.js');
const Constants = require('../Constants.js')
//класс лекарства
class Powerup extends Rect {
    constructor(x, y, w, h, type, data) {
        super(x, y, w, h);
        this.type = type;
        this.data = data;
        this.exist = true;
    }

    static create() {
        const x = Math.random() * Constants.WORLD_WIDTH;
        const y = Math.random() * Constants.WORLD_HEIGHT;
        const w = Constants.POWERUP_WIDTH;
        const h = Constants.POWERUP_WIDTH;
        const type = Constants.POWERUP_TYPES[Math.floor(Math.random() * Constants.POWERUP_TYPES.length)];
        let data = null;
        switch (type) {
            case Constants.POWERUP_PILL_TYPE:
                data = Constants.POWERUP_PILL_HEALTH;
                break;
            case Constants.POWERUP_MASK_TYPE:
                data = Constants.POWERUP_MASK_MULTIPLIER;
                break;
        }
        return new Powerup(x, y, w, h, type, data);
    }

    isExist() {
        return this.exist;
    }
}
module.exports = Powerup;