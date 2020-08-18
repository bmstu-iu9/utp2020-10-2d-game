const Rect = require('./Rect.js');
const Constants = require('../Constants.js')
    //класс лекарства
class Pill extends Rect {
    constructor(w, h) {
        super(w * (Math.random() - 90 / w),
            h * (Math.random() - 90 / h),
            Constants.PILL_WIDTH,
            Constants.PILL_HEIGHT);
        this.health = Constants.HEALTH_OF_PILL;
    }
}
module.exports = Pill;