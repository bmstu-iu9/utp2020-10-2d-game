let Rect = require('./Rect.js');
//класс лекарства
class Pill extends Rect {
    constructor(w, h, pillWidth, pillHeight, health) {
        super(w * (Math.random() - 90 / w), h * (Math.random() - 90 / h), pillWidth, pillHeight);
        this.health = health;
    }
}
module.exports = Pill;