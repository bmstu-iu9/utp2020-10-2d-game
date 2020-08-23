const Rect = require('./Rect.js');
const Constants = require('../Constants.js')
    //класс лекарства
class Pill extends Rect {
    constructor(w, h) {
        super(Math.random() * Constants.WORLD_WIDTH, Math.random() * Constants.WORLD_HEIGHT, w, h);
        this.health = Constants.HEALTH_OF_PILL;
        this.exist = true;
    }

    isExist() {
        return this.exist;
    }
}
module.exports = Pill;