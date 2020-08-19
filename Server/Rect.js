
//используется как родительский класс для объектов типа player, projectile и т.д. для упрощения определения столкновений
let Circle = require('./Circle.js'),
    Point = require('./Point.js');
class Rect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.w = width;
        this.h = height;
    }

    leftUp() {
        return new Point(this.x, this.y);
    }

    rightUp() {
        return new Point(this.x + this.w, this.y);
    }

    leftDown() {
        return new Point(this.x, this.y + this.h);
    }

    rightDown() {
        return new Point(this.x + this.w, this.y + this.h);
    }

    //проверка лежит ли точка point в прямоугольнике
    hasPoint(point) {
        return point.x >= this.leftUp().x && point.x <= this.rightUp().x && point.y >= this.leftUp().y && point.y <= this.rightDown().y;
    }

    //проверка пересекается ли прямоугольник this с rect
    intersect(rect) {
        return this.hasPoint(rect.leftUp()) ||
            this.hasPoint(rect.rightUp()) ||
            this.hasPoint(rect.leftDown()) ||
            this.hasPoint(rect.rightDown());
    }

    //проверка пересекается ли прямоугольник this с кругом
    intersectCircle(circle) {
        return circle.hasPoint(this.x, this.y) ||
            circle.intersect(this.x, this.y, this.leftDown.x, this.leftDown.y) ||
            circle.intersect(this.leftDown.x, this.leftDown.y, this.rightDown.x, this.rightDown.y) ||
            circle.intersect(this.rightDown.x, this.rightDown.y, this.rightUp.x, this.rightUp.y) ||
            circle.intersect(this.rightUp.x, this.rightUp.y, this.x, this.y);
    }
}
module.exports = Rect;
