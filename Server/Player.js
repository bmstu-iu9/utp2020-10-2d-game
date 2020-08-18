const Rect = require('./Rect.js');
const Constants = require('../Constants');
const Projectile = require('./Projectile.js');
//класс игрока
class Player extends Rect {
    constructor(role, name, w, h) {
        super(0, 0, Constants.PLAYER_WIDTH, Constants.PLAYER_HEIGHT);
        this.screenWidth = w;
        this.screenHeight = h;
        this.name = name;
        this.role = role;
        this.projectiles = [];
        this.dx = 3;
        this.dy = 3;
        this.alive = true;
        if (role === 'Human') {
            this.typeOfWeapon = 'pistol'; //тип оружия
            this.countOfBulletInWeapon = 5; //текущее количество пуль в оружии
            this.weaponCapacity = 5; //максимальная ёмкость в обойме
            this.reloading = false; //показывает находится ли оружие в процессе перезарядки
            this.health = Constants.HUMAN_MAX_HEALTH;
        } else {
            this.health = Constants.ZOMBIE_MAX_HEALTH;
            this.typeOfWeapon = 'cough'; //тип оружия
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

    //проаерка на наличие патронов для стрельбы
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
        if (this.health < 0) {
            this.alive = false;
            this.health = 0;
        }
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

    //двигает все снаряды этого игрока
    moveProjectiles() {
        for (let i = 0; i < this.projectiles.length; i++) {
            this.projectiles[i].move();
            if (this.projectiles[i].flewAway()) { //удаляем, если снаряд вылетел за свою зону поражения
                this.projectiles[i].exist = false;
            }
        }
    }

    isAlive() {
        return this.alive;
    }
    addProjectile(projectile,dop) {
        let p = new Projectile();
        this.projectiles.unshift(p.cloneWith({}).cloneWith(projectile).cloneWith(dop));
    }
}
module.exports = Player;