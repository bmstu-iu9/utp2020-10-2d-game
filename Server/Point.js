//класс точка с координатами в прямоугольной декартовой системе на плоскости\
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    //метод нахождения расстояния между точкой this и sP
    findDist(sP) {
        return Math.round(Math.sqrt((sP.x - this.x) * (sP.x - this.x) + (sP.y - this.y) * (sP.y - this.y)));
    }
}
module.exports = Point;