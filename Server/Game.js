const Rect = require('./Rect.js');
const Player = require('./Player.js');
const Circle = require('./Circle.js');
const Epidemic = require('./Epidemic.js');
const Point = require('./Point.js');
const Pill = require('./Pill.js');
const Projectile = require('./Projectile.js')
const Constants = require('../Constants.js');
class Game {
    constructor() {
        this.clients = new Map();
        this.players = {};
        this.humanCount = 0;
        this.zombieCount = 0;
        this.pills = {};
        this.epidemicArea = new Epidemic(new Point(0, 0), 0);
    }

    //проверка, что людей становится слишком много
    demographicImbalance() {
        return this.humanCount > this.zombieCount + 1;
    }

    //возвращает точку с координатами около рандомного игрока, являющегося человеком
    randomHuman() {
        let keys = Object.keys(this.players),
            curPlayer = this.players[keys[Math.floor(Math.random() * (keys.length - 1))]];
        while (curPlayer.role !== 'Human')
            curPlayer = this.players[keys[Math.floor(Math.random() * keys.length)]];
        return new Point(Math.abs(curPlayer.x - 15), Math.abs(curPlayer.y - 15));
    }

    //вспышка эпидемии случается рядом со случайным человеком
    outbreak() {
        if (this.demographicImbalance()) {
            console.log('we need more zombie! Zombie: ' + this.zombieCount + ' Human: ' + this.humanCount);
            let c = this.randomHuman();
            this.epidemicArea = new Epidemic(c, 0);
            this.epidemicArea.coordinateFixed = true;
            this.epidemicArea.marker = true;
            this.epidemicArea.start = Date.now();
        }
    }

    //поиск имени среди уже существующих на сервере
    findName(name) {
        for (let key in this.players)
            if (this.players[key].name === name)
                return 1;
        return 0;
    }

    collisionWithEpidemicArea(id) {
        if (this.players[id].role === 'Human' &&
            this.players[id].intersectCircle(this.epidemicArea)) { //люди, которых задело
            this.turningIntoZombie(id)
        }
    }

    //проверяет какие таблетки подобрал игрок
    collisionWithPills(id) {
        let player = this.players[id];
        for (let i in this.pills) {
            if (player.intersect(this.pills[i])) {
                this.players[id].increaseHealth(this.pills[i].health);
                delete this.pills[i];
            }
        }
    }

    //просчитываем получение урона игроком id от снарядов других игроков
    collisionWithProjectile(id) {
        let player = this.players[id];
        for (let key in this.players) {
            if (key !== id && this.players[key].role !== player.role && this.players[key].isAlive()) {
                for (let i = 0; i < this.players[key].projectiles.length; i++) {
                    let projectile = this.players[key].projectiles[i];
                    if (!projectile.isExist()) continue; //если снаряд уничтожен
                    if (player.intersect(projectile)) {
                        this.players[id].decreaseHealth(this.players[key].projectiles[i].damage);//уменьшаем здоровье игрока, по которому попали
                        this.players[key].projectiles[i].exist = false;
                        if (this.players[id].health === 0) {
                            if (player.role === 'Zombie') {
                                this.players[id].alive = false; //удаляем его из списка игроков
                                this.clients.get(id).socket.emit('gameOver');
                                return;
                            } else {
                                this.turningIntoZombie(id);
                                return;
                            }
                        }
                    }
                }
            }
        }
    }

    turningIntoZombie(id) {
        const player = this.players[id];
        this.players[id] = new Player('Zombie', player.name, player.screenWidth, player.screenHeight, player.w, player.h);
        this.players[id].x = player.x;
        this.players[id].y = player.y;
        --this.humanCount;
        ++this.zombieCount;
    }

    update() {
        //движение снарядов
        this.moveProjectiles();
        //столкновение с таблетками
        for (let key in this.players) {
            if (this.players[key].isAlive())
                this.collisionWithPills(key);
        }
        if (!this.epidemicArea.coordinateFixed)
            this.outbreak();
        else if (this.epidemicArea.marker) {
            if (this.epidemicArea.isTooBig()) {
                this.epidemicArea.marker = false;
                this.epidemicArea.coordinateFixed = false;
            } else {
                console.log("EPIDEMIC AREA RADIUS IS " + this.epidemicArea.radius)
                this.epidemicArea.increaseRadius();
            }
        }
        //столкновение с epidemicArea
        for (let key in this.players) {
            if (this.players[key].isAlive()) {
                if (this.epidemicArea.marker)
                    this.collisionWithEpidemicArea(key);
            }
        }
        //столкновение игроков со снарядами
        for (let key in this.players) {
            if (this.players[key].isAlive())
                this.collisionWithProjectile(key);
        }
        //удаляем убитых игроков
        for (let key in this.players) {
            if (!this.players[key].isAlive()) {
                if (this.players[key].role === 'Human')
                    --this.humanCount;
                else --this.zombieCount;
                delete this.players[key];
            }
        }
        //удаляем уничтоженные снаряды
        for (let key in this.players) {
            for (let i = 0; i < this.players[key].projectiles.length; i++) {
                if (!this.players[key].projectiles[i].isExist())
                    this.players[key].projectiles.splice(i, 1);
            }
        }

    }

    addProjectile(socket, projectile) {
        if (this.players[socket.id].role === 'Human') {
            projectile.projectileHeight = Constants.BULLET_HEIGHT;
            projectile.projectileWidth = Constants.BULLET_WIDTH;
            projectile.type = Constants.TYPE_BULLET;
            projectile.projectileSpeed = Constants.SPEED_OF_BULLET;
            projectile.damage = Constants.BULLET_DAMAGE;
        } else {
            projectile.projectileHeight = Constants.COUGH_HEIGHT;
            projectile.projectileWidth = Constants.COUGH_WIDTH;
            projectile.type = Constants.TYPE_COUGH;
            projectile.projectileSpeed = Constants.SPEED_OF_COUGH;
            projectile.damage = Constants.COUGH_DAMAGE;
        }
        if (this.players[socket.id].isWeaponEmpty()) { //если патроны закончились
            if (!this.players[socket.id].reloading) { //если оружие не перезаряжается
                this.players[socket.id].reloading = true;
                this.players[socket.id].reloadingStart = Date.now();
            } else if (Date.now() - this.players[socket.id].reloadingStart >= Constants.RELOAD_PISTOL) {
                this.players[socket.id].countOfBulletInWeapon = this.players[socket.id].weaponCapacity;
                this.players[socket.id].reloading = false;
            }
        } else {
            this.players[socket.id].shoot();
            if (!projectile.mouseMove) {
                const startPoint = new Point(this.players[socket.id].x + Constants.PLAYER_WIDTH / 2,
                    this.players[socket.id].y + Constants.PLAYER_HEIGHT / 2);
                this.players[socket.id].addProjectile(projectile, {startPoint: startPoint});
            } else {
                let player = this.players[socket.id],
                    points = (new Point(player.x + player.w / 2, player.y + player.h / 2)).findPoints(
                        new Point(projectile.mouseX, projectile.mouseY),
                        (player.h * player.h + player.w * player.w) / 4),
                    fP = points.firstPoint,
                    sP = points.secondPoint;
                if (new Point(projectile.mouseX, projectile.mouseY).findDist(fP)
                    > new Point(projectile.mouseX, projectile.mouseY).findDist(sP)) {
                    this.players[socket.id].addProjectile(projectile, {
                        x: sP.x,
                        y: sP.y,
                        startPoint: new Point(player.x + Constants.PILL_WIDTH / 2, player.y + Constants.PLAYER_HEIGHT / 2)
                    });
                } else {
                    this.players[socket.id].addProjectile(projectile, {
                        x: fP.x,
                        y: fP.y,
                        startPoint: new Point(player.x + Constants.PLAYER_WIDTH / 2, player.y + Constants.PLAYER_HEIGHT / 2)
                    });
                }
            }
        }
    }

    moveProjectiles() {
        for (let key in this.players) {
            if (this.players[key].isAlive())
                this.players[key].moveProjectiles();
        }
    }

    //добавляет нового игрока
    addPlayer(player, socket) {
        this.players[socket.id] = new Player(player.role, player.name, player.width, player.height);
        this.clients.set(socket.id, socket);
        if (player.role === 'Zombie')
            this.zombieCount++;
        else
            this.humanCount++;
        console.log(this.humanCount + " " + this.zombieCount);
    }

    //добавляет новую таблетку
    addPill() {
        let p = new Pill(599, 700, Constants.PILL_WIDTH, Constants.PILL_HEIGHT, Constants.HEALTH_OF_PILL);//переделать
        this.pills[p.x + '#' + p.y] = p;
    }

    sendState() {
        this.clients.forEach((client, socketID) => {
            const currentPlayer = this.players[socketID]
            this.clients.get(socketID).emit(Constants.STATE_UPDATE, {
                me: currentPlayer,
                players: this.players,
                pills: this.pills,
                area: this.epidemicArea
            })
        })
    }
}

module.exports = Game;