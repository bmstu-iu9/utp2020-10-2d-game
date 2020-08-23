const Rect = require('./Rect.js');
const Constants = require('../Constants.js')
class Mask extends Rect {
    constructor(w,h) {
        super(Math.random() * Constants.WORLD_WIDTH, Math.random() * Constants.WORLD_HEIGHT, w, h);
        this.virusDamageMultiplier = Constants.MEDICINE_MASK_MULTIPLIER;
    }
}