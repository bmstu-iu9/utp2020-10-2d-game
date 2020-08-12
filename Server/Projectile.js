let Rect = require('./Rect.js');
//класс снаряда
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
        const fields = ['x', 'y', 'w', 'h', 'mouseX', 'mouseY', 'mouseMove', 'type', 'projectileSpeed', 'damage'],
            res = new Projectile();
        for (let field in fields) {
            res[fields[field]] = (props[fields[field]] == undefined) ? this[fields[field]] : props[fields[field]];
        }
        return res;
    }
}
module.exports = Projectile;