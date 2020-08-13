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
    //находит пару точек (x,y), которые лежат на расстоянии sqrt(dist) от this и принадлежат прямой this p
    findPoint(p, dist) {
        let modulYMinusY1 = Math.sqrt(dist * (p.y - this.y) * (p.y - this.y) / ((p.x - this.x) * (p.x - this.x) + (p.x - this.y) * (p.y - this.y))),
            firstY = modulYMinusY1 + this.y,
            firstX = (firstY - this.y) * (p.x - this.x) / (p.y - this.y) + this.x,
            secondY = this.y - modulYMinusY1,
            secondX = (secondY - this.y) * (p.x - this.x) / (p.y - this.y) + this.x;
        return {
            firstPoint: new Point(Math.round(firstX), Math.round(firstY)),
            secondPoint: new Point(Math.round(secondX), Math.round(secondY))
        };
    }
}
module.exports = Point;