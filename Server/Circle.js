let Point = require('./Point.js');
//класс для круговых объектов, используется как родительский
class Circle {
    constructor(o, r) {
        this.o = o;
        this.radius = r;
    }

    //проверка пересекает ли отрезок окружность this
    intersect(x1, y1, x2, y2) {
        //отрезок параллелен одной из сторон экрана
        let s1 = new Point(x1, y1).findDist(new Point(this.o.x, this.o.y)),
            s2 = new Point(x2, y2).findDist(new Point(this.o.x, this.o.y));
        if (s1 <= this.radius || s2 <= this.radius)
            return true;
        else if ((x1 === x2 && x1 - this.o.x <= this.radius) ||
            (y1 = y2 && y1 - this.o.x <= this.radius))
            return true;
        return false;

        //общий случай для отрезков, непараллельным осям координат
        /*let a = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1),
           b = 2 * ((x1 - this.o.x) * (x2 - x1) + (y1 - this.o.y) * (y2 - y1)),
           c = (x1 - this.o.x) * (x1 - this.o.x) +
              (y1 - this.o.y) * (y1 - this.o.y) -
              this.radius * this.radius,
           t1 = (- b + Math.sqrt(b * b - 4 * a * c)) / (2 * a),
           t2 = (- b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);

        let curX = x1 + t1 * (x2 - x1);

        if ((x1 <= x2 && curX <= x2 && curX >= x1) ||
           (x1 > x2 && curX <= x1 && curX >= x2))
           return true;
        else {
           curX = x1 + t2 * (x2 - x1);
           if ((x1 <= x2 && curX <= x2 && curX >= x1) ||
              (x1 > x2 && curX <= x1 && curX >= x2))
              return true;
        }
        return false;*/
    }

    //проверка находится ли точка внутри окружности this
    hasPoint(x, y) {
        return (this.o.x - x) * (this.o.x - x) +
            (this.o.y - y) * (this.o.y - y) <= this.radius * this.radius;
    }
}
module.exports = Circle;