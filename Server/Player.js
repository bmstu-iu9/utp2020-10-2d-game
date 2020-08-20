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
        if (role === Constants.HUMAN_TYPE) {
            this.countOfBulletInWeapon = 5; //текущее количество пуль в оружии
            this.weaponCapacity = 5; //максимальная ёмкость в обойме
            this.reloading = false; //показывает находится ли оружие в процессе перезарядки
            this.health = Constants.HUMAN_MAX_HEALTH;
        } else {
            this.health = Constants.ZOMBIE_MAX_HEALTH;
        }
    }

    shoot() {
        if (this.role === Constants.ZOMBIE_TYPE) {
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
        if (this.role === Constants.ZOMBIE_TYPE)
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
        if (this.y + this.h + 40 < Constants.WORLD_HEIGHT) {
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
        if (this.x + this.w < Constants.WORLD_WIDTH) {
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

    addProjectile(p, startPoint, mouseX, mouseY) {
        if (this.role === Constants.ZOMBIE_TYPE)
            this.projectiles.unshift(new Projectile(p.x, p.y, startPoint, mouseX, mouseY, Constants.COUGH_TYPE));
        else this.projectiles.unshift(new Projectile(p.x, p.y, startPoint, mouseX, mouseY, Constants.BULLET_TYPE));
    }
}
module.exports = Player;