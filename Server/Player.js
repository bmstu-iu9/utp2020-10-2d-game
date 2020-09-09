const Rect = require('./Rect.js');
const Constants = require('../Constants');
const Projectile = require('./Projectile.js');
const Point = require('./Point.js');
const Chat = require('./Chat.js');
const Wall = require('../Wall.js');
//класс игрока
class Player extends Rect {
    constructor(role, name, w, h) {
		let x, y;
		while (true) {
			x = Math.random() * Constants.WORLD_WIDTH;
			y = Math.random() * Constants.WORLD_HEIGHT;
			let flag = true;
			for (let arr of Wall) {
				if (x + Constants.PLAYER_WIDTH > arr[0] && x < arr[1] && y + Constants.PLAYER_WIDTH > arr[2] && y < arr[3]) {
					flag = false;
					break;
				}
    		}
			if (flag) {
				break;
			}
		}
		super(x, y, Constants.PLAYER_WIDTH, Constants.PLAYER_HEIGHT);
        this.screenWidth = w;
        this.screenHeight = h;
        this.name = name;
        this.role = role;
        this.projectiles = [];
        this.alive = true;
        this.timeOfLastShoot = 0;
        this.powerups = {};
        if (role === Constants.HUMAN_TYPE) {
            this.dx = Constants.HUMAN_SPEED;
            this.dy = Constants.HUMAN_SPEED;
            this.countOfBulletInWeapon = 5; //текущее количество пуль в оружии
            this.weaponCapacity = 5; //максимальная ёмкость в обойме
            this.reloading = false; //показывает находится ли оружие в процессе перезарядки
            this.health = Constants.HUMAN_MAX_HEALTH;
            this.timeBetweenShoot = Constants.HUMAN_TIME_BETWEEN_SHOOTS;
        } else {
            this.dx = Constants.ZOMBIE_SPEED;
            this.dy = Constants.ZOMBIE_SPEED;
            this.health = Constants.ZOMBIE_MAX_HEALTH;
            this.timeBetweenShoot = Constants.ZOMBIE_TIME_BETWEEN_SHOOTS;
        }
        this.mouseX = 0;
        this.mouseY = 0;
        this.angleOfRotation = 0;
        this.damageMultiplier = Constants.PLAYER_DEFAULT_MULTIPLIER;
        this.lastUpdateTime = Date.now();
    }

    shoot(projectile) {
        if (this.isWeaponEmpty()) { //если патроны закончились
            if (!this.reloading) { //если оружие не перезаряжается
                this.reloading = true;
                this.reloadingStart = Date.now();
            } else if (this.lastUpdateTime - this.reloadingStart >= Constants.RELOAD_PISTOL) {
                this.countOfBulletInWeapon = this.weaponCapacity;
                this.reloading = false;
            }
            return;
        }
        if (this.lastUpdateTime - this.timeOfLastShoot >= this.timeBetweenShoot) {
            this.timeOfLastShoot = this.lastUpdateTime;
            if (this.role === Constants.HUMAN_TYPE)
                --this.countOfBulletInWeapon;
            let p, startPoint
            const points = (new Point(this.x + this.w / 2, this.y + this.h / 2)).findPoints(
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
            startPoint = new Point(this.x + this.w / 2, this.y + this.h / 2);
            this.addProjectile(p, startPoint, projectile.mouseX, projectile.mouseY)
        }
    }

    update(currentTime) {
        this.lastUpdateTime = currentTime;
        this.updatePowerups();

    }
    updatePowerups() {
        for(let key in this.powerups) {
            const powerup = this.powerups[key];
            if(this.lastUpdateTime >= powerup.expirationTime) {
                switch (powerup.type) {
                    case Constants.POWERUP_PILL_TYPE:
                        break;
                    case Constants.POWERUP_MASK_TYPE:
                        this.damageMultiplier = Constants.PLAYER_DEFAULT_MULTIPLIER;
                        break;
                }
                delete this.powerups[key];
            }
        }
    }
    pickUpPowerup(powerup) {
        powerup.pickUp(this.lastUpdateTime);
        this.powerups[powerup.type] = powerup;
        switch (powerup.type) {
            case Constants.POWERUP_PILL_TYPE:
                this.increaseHealth(powerup.data);
                break;
            case Constants.POWERUP_MASK_TYPE:
                this.damageMultiplier = powerup.data;
                break;
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
        const A = new Point(this.x + this.w / 2, this.y + this.h / 2);
        const C = new Point(this.mouseX, this.mouseY);
        /*
            Пытаемся понять, где находится 3 вершина треугольника,
            в которой прямой угол.(A - чачало координат) 1 if - 1 четверть, 2 if - 2 четверть и т.д..
         */
        if (A.x <= C.x && A.y >= C.y) {
            const B = new Point(A.x, C.y);
            this.angleOfRotation = Math.atan(B.findDist(C) / A.findDist(B));
        }
        if (A.x <= C.x && A.y <= C.y) {
            const B = new Point(C.x, A.y);
            this.angleOfRotation = Math.atan(B.findDist(C) / A.findDist(B)) + Math.PI / 2;
        }
        if (A.x >= C.x && A.y <= C.y) {
            const B = new Point(A.x, C.y);
            this.angleOfRotation = Math.atan(B.findDist(C) / A.findDist(B)) + Math.PI;
        }
        if (A.x >= C.x && A.y >= C.y) {
            const B = new Point(C.x, A.y);
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
	let flag = true;
	for (let arr of Wall) {
		if (this.x + this.w < arr[0] + this.dx || this.x >= arr[1] - this.dx || this.y + this.h < arr[2] || this.y >= arr[3] - this.dy) {
		}
		else { 
			flag = false;
			break;
		}
	}
	if (flag && this.y + this.h < Constants.WORLD_HEIGHT) {
		this.y += this.dy;
        }
    }

    moveUp() {
	let flag = true;
	for (let arr of Wall) {
		if (this.x + this.w <= arr[0] + this.dx || this.x >= arr[1] - this.dx || this.y + this.h <= arr[2] + this.dy || this.y > arr[3]) {
		}
		else { 
			flag = false;
			break;
		}
	}
	if (flag && this.y > 0) {
		this.y -= this.dy;
        }
    }

    moveLeft() {
	let flag = true;
	for (let arr of Wall) {
		if (this.x + this.w <= arr[0] + this.dx || this.x > arr[1] || this.y + this.h <= arr[2] + this.dy || this.y >= arr[3] - this.dy) {
		}
		else { 
			flag = false;
			break;
		}
	}
	if (flag && this.x > 0) {
		this.x -= this.dx;
        }
    }

    moveRight() {
	let flag = true;
	for (let arr of Wall) {
		if (this.x + this.w < arr[0] || this.x >= arr[1] - this.dx || this.y + this.h <= arr[2] + this.dy || this.y >= arr[3] - this.dy) {
		}
		else { 
			flag = false;
			break;
		}
	}
	if (flag && this.x + this.w < Constants.WORLD_WIDTH) {
		this.x += this.dx;
        }
    }

    //двигает все снаряды этого игрока
    moveProjectiles() {
        for (let i = 0; i < this.projectiles.length; i++) {
            this.projectiles[i].move();
            if (this.projectiles[i].isWall() || this.projectiles[i].flewAway()) { //удаляем, если снаряд вылетел за свою зону поражения
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
