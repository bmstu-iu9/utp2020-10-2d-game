const Rect = require('./Rect.js');
const Point = require('./Point.js');
const Constants = require('../Constants.js');
class Projectile extends Rect {
    constructor(x, y,startPoint, mouseX, mouseY, type) {
        super(x, y, Constants.PROJECTILE_WIDTH,Constants.PROJECTILE_HEIGHT);
        this.mouseX = mouseX; //координаты мышки в момент выпуска сняряда
        this.mouseY = mouseY; //используяются для определения траектории полёта снаряда
        this.startPoint = startPoint;
        this.type = type;
        this.exist = true;
        if (this.type === Constants.BULLET_TYPE) {
            this.projectileSpeed = Constants.SPEED_OF_BULLET;
            this.damage = Constants.BULLET_DAMAGE;
            this.flightDistance = Constants.BULLET_FLIGHT_DISTANCE;
        } else {
            this.projectileSpeed = Constants.SPEED_OF_COUGH;
            this.damage = Constants.COUGH_DAMAGE;
            this.flightDistance = Constants.COUGH_FLIGHT_DISTANCE;
        }
    }

    //заменяет свойства this,с именами из массива fields, одноимёнными свойствами из props(если в props их нет, то оствялет то, что было в this)
    cloneWith(props) {
        const fields = ['x', 'y', 'w', 'h', 'mouseX', 'mouseY', 'type', 'projectileSpeed', 'damage', 'startPoint'],
            res = new Projectile();
        for (let field in fields) {
            res[fields[field]] = (props[fields[field]] == undefined) ? this[fields[field]] : props[fields[field]];
        }
        return res;
    }

    //перемещение снаряда по изначальной траектории(прямой startPoint и (mouseX,mouseY)
    move() {
        let points = (new Point(this.x, this.y)).findPoints(new Point(this.mouseX, this.mouseY), Math.pow(this.projectileSpeed, 2)),
            fP = points.firstPoint,
            sP = points.secondPoint,
            fDist = this.startPoint.findDist(fP),
            sDist = this.startPoint.findDist(sP);
        if (fDist > sDist) {
            this.x = fP.x;
            this.y = fP.y;
        } else {
            this.x = sP.x;
            this.y = sP.y;
        }
    }

    //проверка улетел ли снаряд на свой радиус поражения
    flewAway() {
        return this.startPoint.findDist(new Point(this.x, this.y)) > this.flightDistance;
    }

    //существует ли снаряд
    isExist() {
        return this.exist;
    }
}
module.exports = Projectile;