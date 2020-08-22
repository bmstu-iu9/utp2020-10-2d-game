const Rect = require('./Rect.js');
const Constants = require('../Constants');
const Projectile = require('./Projectile.js');
const Point = require('./Point.js');
const Chat = require('./Chat.js');
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
        this.timeOfLastShoot = Date.now();
        if (role === Constants.HUMAN_TYPE) {
            this.countOfBulletInWeapon = 5; //текущее количество пуль в оружии
            this.weaponCapacity = 5; //максимальная ёмкость в обойме
            this.reloading = false; //показывает находится ли оружие в процессе перезарядки
            this.health = Constants.HUMAN_MAX_HEALTH;
            this.timeBetweenShoot = Constants.HUMAN_TIME_BETWEEN_SHOOTS;
        } else {
            this.health = Constants.ZOMBIE_MAX_HEALTH;
            this.timeBetweenShoot = Constants.ZOMBIE_TIME_BETWEEN_SHOOTS;
        }
        this.mouseX = 0;
        this.mouseY = 0;
        this.angleOfRotation = 0;
    }

    shoot(projectile) {
        if (this.isWeaponEmpty()) { //если патроны закончились
            if (!this.reloading) { //если оружие не перезаряжается
                this.reloading = true;
                this.reloadingStart = Date.now();
            } else if (Date.now() - this.reloadingStart >= Constants.RELOAD_PISTOL) {
                this.countOfBulletInWeapon = this.weaponCapacity;
                this.reloading = false;
            }
            return;
        }
        if (Date.now() - this.timeOfLastShoot >= this.timeBetweenShoot) {
            this.timeOfLastShoot = Date.now();
            if (this.role === Constants.HUMAN_TYPE)
                --this.countOfBulletInWeapon;
            let p, startPoint
            const points = (new Point(this.x + this.w / 2, this.y + this.h / 2 + 40)).findPoints(
                new Point(projectile.mouseX, projectile.mouseY),
                (this.h * this.h + this.w * this.w) / 4),
                fP = points.firstPoint,
                sP = points.secondPoint;
            if (new Point(projectile.mouseX, projectile.mouseY).findDist(fP) >
                new Point(projectile.mouseX, projectile.mouseY).findDist(sP)) {
                p = sP;
            } else {
                p = fP;
            }
            startPoint = new Point(this.x + this.w / 2, this.y + this.h / 2 + 40);
            this.addProjectile(p, startPoint, projectile.mouseX, projectile.mouseY)
        }
    }

    updateOnInput(state) {
        if (state.down && !state.inputFocus) {
            this.moveDown();
        }
        if (state.left && !state.inputFocus) {
            this.moveLeft();
        }
        if (state.up && !state.inputFocus) {
            this.moveUp();
        }
        if (state.right && !state.inputFocus) {
            this.moveRight();
        }
        this.mouseY = state.mouseY;
        this.mouseX = state.mouseX;
        this.updateAngleOfRotation();
    }

    updateAngleOfRotation() {
        const A = new Point(this.x + this.w / 2, this.y + this.h / 2 + 40);
        const C = new Point(this.mouseX, this.mouseY);
        if (A.x <= this.mouseX && A.y >= this.mouseY) {
            const B = new Point(this.x + this.w / 2, this.mouseY);
            this.angleOfRotation = Math.atan(B.findDist(C) / A.findDist(B));
        }
        if (A.x <= this.mouseX && A.y <= this.mouseY) {
            const B = new Point(this.mouseX, this.y + this.h / 2 + 40);
            this.angleOfRotation = Math.atan(B.findDist(C) / A.findDist(B)) + Math.PI / 2;
        }
        if (A.x >= this.mouseX && A.y <= this.mouseY) {
            const B = new Point(this.x + this.w / 2, this.mouseY);
            this.angleOfRotation = Math.atan(B.findDist(C) / A.findDist(B)) + Math.PI;
        }
        if (A.x >= this.mouseX && A.y >= this.mouseY) {
            const B = new Point(this.mouseX, this.y + this.h / 2 + 40);
            this.angleOfRotation = Math.atan(B.findDist(C) / A.findDist(B)) + Math.PI * 3 / 2;
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