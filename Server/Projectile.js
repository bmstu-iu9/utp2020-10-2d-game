const Rect = require('./Rect.js');
const Point = require('./Point.js');
const Constants = require('../Constants.js');
//класс снаряда
function findPoint(x1, y1, x2, y2, dist) {
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
function findDist(fP, sP) {
    return Math.round(Math.sqrt((sP.x - fP.x) * (sP.x - fP.x) + (sP.y - fP.y) * (sP.y - fP.y)));
}
class Projectile extends Rect {
    constructor(x, y, projectileWidth, projectileHeight, mouseX, mouseY, mouseMove, type, projectileSpeed, damage) {
        super(x, y, projectileWidth, projectileHeight);
        this.mouseX = mouseX; //координаты мышки в момент выпуска сняряда
        this.mouseY = mouseY; //используяются для определения траектории полёта снаряда
        this.mouseMove = mouseMove;
        this.type = type;
        this.projectileSpeed = projectileSpeed; //скорость снаряда
        this.damage = damage; //урон от попадание этим снарядом
    }

    //заменяет свойства this,с именами из массива fields, одноимёнными свойствами из props(если в props их нет, то оствялет то, что было в this)
    cloneWith(props) {
        const fields = ['x', 'y', 'w', 'h', 'mouseX', 'mouseY', 'mouseMove', 'type', 'projectileSpeed', 'damage', 'startPoint'],
            res = new Projectile();
        for (let field in fields) {
            res[fields[field]] = (props[fields[field]] == undefined) ? this[fields[field]] : props[fields[field]];
        }
        return res;
    }

    move() {
        if (!this.mouseMove) {
            this.x += this.projectileSpeed;
        } else {
            let points = findPoint(this.x, this.y, this.mouseX, this.mouseY, Math.pow(this.projectileSpeed, 2)),
                fP = points.firstPoint,
                sP = points.secondPoint,
                fDist = findDist(this.startPoint, fP),
                sDist = findDist(this.startPoint, sP);
            console.log("fP: " + fP.x + " " + fP.y + "; sP: " + sP.x + " " + sP.y + "\n");
            if (fDist > sDist) {
                console.log("FP")
                this.x = fP.x;
                this.y = fP.y;
            } else {
                console.log("SP");
                this.x = sP.x;
                this.y = sP.y;
            }
        }
    }
}
module.exports = Projectile;