//класс точка с координатами в прямоугольной декартовой системе на плоскости\
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    //метод нахождения расстояния между точкой this и sP
    findDist(sP) {
        return Math.sqrt((sP.x - this.x) * (sP.x - this.x) + (sP.y - this.y) * (sP.y - this.y));
    }
    //находит пару точек (x,y), которые лежат на расстоянии sqrt(dist) от this и принадлежат прямой this p
    findPoints(p, dist) {
        const x1 = this.x,
            y1 = this.y,
            x2 = p.x,
            y2 = p.y;
        let modulYMinusY1 = Math.sqrt(dist * (y2 - y1) * (y2 - y1) / ((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))),
            firstY = modulYMinusY1 + y1,
            firstX = (firstY - y1) * (x2 - x1) / (y2 - y1) + x1,
            secondY = y1 - modulYMinusY1,
            secondX = (secondY - y1) * (x2 - x1) / (y2 - y1) + x1;
        return {
            firstPoint: new Point(Math.round(firstX), Math.round(firstY)),
            secondPoint: new Point(Math.round(secondX), Math.round(secondY))
        };
    }
}
module.exports = Point;