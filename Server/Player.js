const Rect = require('./Rect.js');
const Constants = require('../Constants')
//класс игрока
class Player extends Rect {
    constructor(role, name, w, h, playerWidth, playerHeight) {
        super(0, 0, playerWidth, playerHeight);
        this.screenWidth = w;
        this.screenHeight = h;
        this.name = name;
        this.role = role;
        this.projectiles = [];
        this.dx = 3;
        this.dy = 3;
        if (role === 'Human') {
            this.typeOfWeapon = 'pistol'; //тип оружия
            this.countOfBulletInWeapon = 5; //текущее количесьтво пуль в оружии
            this.weaponCapacity = 5; //максимальная ёмкость в обойме
            this.reloading = false; //показывает находится ли оружие в процессе перезарядки
            this.projectileDamage = 0.10; //урон от пули из оружие игрока
            this.projectileFlightDistance = 400; //дальность полёта пули из оружия игрока
            this.health = Constants.HUMAN_MAX_HEALTH;
        } else {
            this.health = Constants.ZOMBIE_MAX_HEALTH;
            this.projectileDamage = 0.05;  //урон от пули из оружие игрока
            this.typeOfWeapon = 'cough'; //тип оружия
            this.projectileFlightDistance = 200; //дальность полёта пули из оружия игрока
        }
    }

    shoot() {
        if (this.role === 'Zombie') {
            return true;
        } else {
            if (this.countOfBulletInWeapon > 0) {
                --this.countOfBulletInWeapon;
                return true;
            } else return false;
        }
    }

    isWeaponEmpty() {
        if (this.role === 'Zombie')
            return false;
        else return this.countOfBulletInWeapon === 0;
    }

    increaseHealth(health) {
        this.health += health;
        if (this.health > 1.00)
            this.health = 1.00;
    }

    decreaseHealth(damage) {
        this.health -= damage;
        if (this.health < 0)
            this.health = 0;
    }

    moveDown() {
        if (this.y + 120 < this.screenHeight) {
            this.y += this.dy;
        }
    }

    moveUp() {
        if (this.y > 0) {
            this.y -= this.dy;
        }
    }

    moveLeft() {
        if (this.x > 0) {
            this.x -= this.dx;
        }
    }

    moveRight() {
        if (this.x + 90 < this.screenWidth) {
            this.x += this.dx;
        }
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

}
module.exports = Player;