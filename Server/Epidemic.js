const Circle = require('./Circle.js');
const Constants = require('../Constants.js')
//класс для вспышки эпидемии
class Epidemic extends Circle {
    constructor(o, r) {
        super(o, r);
        this.marker = false; //отвечате за то, нужно ли отрисовывать облако эпидемии
        this.coordinateFixed = false; //зафисксированы ли координаты для будущего рисования
        this.start = Date.now();
    }

    increaseRadius() {
        this.radius = (Date.now() - this.start) * 0.15
    }
    isTooBig() {
        return this.radius > Constants.MAX_RADIUS_OF_EPIDEMIC_AREA;
    }
}
module.exports = Epidemic;