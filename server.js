'use strict'

const express = require('express'),
    app = express(),
    http = require('http').createServer(app),
    io = require('socket.io')(http),
    fs = require('fs'),
    Rect = require('./Server/Rect.js'),
    Player = require('./Server/Player.js'),
    Circle = require('./Server/Circle.js'),
    Epidemic = require('./Server/Epidemic.js'),
    Point = require('./Server/Point.js'),
    Pill = require('./Server/Pill.js'),
    Projectile = require('./Server/Projectile.js'),
    Constants = require('./Constants.js');
let players = {},
    humanCount = 0,
    zombieCount = 0,
    pills = {},
    epidemicArea = new Epidemic(new Point(0, 0), 0);

//поиск имени среди уже существующих на сервере
function findName(name) {
    for (let key in players)
        if (players[key].name === name)
            return 1;
    return 0;
}
//находит пару точек (x,y), которые лежат на расстоянии sqrt(dist) от (x1,y1) и принадлежат прямой (x1,y1) (x2,y2)
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

//проверка, что людей становится слишком много
function demographicImbalance() {
    return humanCount > zombieCount + 1;
}

//возвращает точку с координатами около рандомного игрока, являющегося человеком
function randomHuman() {
    let keys = Object.keys(players),
        curPlayer = players[keys[Math.floor(Math.random() * (keys.length - 1))]],
        errorName = keys[Math.floor(Math.random() * (keys.length - 1))];
    try {
        while (curPlayer.role !== 'Human')
            curPlayer = players[keys[Math.floor(Math.random() * keys.length)]];
        return new Point(Math.abs(curPlayer.x - 15), Math.abs(curPlayer.y - 15));
    } catch (error) {
        if (errorName in players)
            throw error;
        else
            console.log("Player disconnected in randomHuman");
    }

}
//вспышка эпидемии случается рядом со случайным человеком
function outbreak() {
    if (demographicImbalance()) {
        console.log('we need more zombie! Zombie: ' + zombieCount + ' Human: ' + humanCount);
        let c = randomHuman();
        epidemicArea = new Epidemic(c, 0);
        epidemicArea.coordinateFixed = true;
        setTimeout(function () {
            epidemicArea.marker = true;
            epidemicArea.start = Date.now();
            setTimeout(function () {
                epidemicArea.marker = false;
                epidemicArea.coordinateFixed = false;
            }, 1500);
        }, 2000);
    }
}

function collisionWithEpidemicArea(socket) {
    console.log('epidemic radius : ' + epidemicArea.radius);
    let errorName = socket.id;
    try {
        let key = socket.id;
        if (players[key].role === 'Human' &&
            players[key].intersectCircle(epidemicArea)) { //люди, которых задело
            let x = players[key].x,
                y = players[key].y;
            delete players[key];
            socket.emit('turningIntoZombie', { x: x, y: y }); //превращаются в зомби
        }
    } catch (error) {
        if (errorName in players)
            throw new error;
        else
            console.log("Player disconnected in collisionWithEpidemicArea");
    }
}

io.on('connection', socket => {
    let timerOfPills,
        timerOfRender,
        reload;
    console.log('user connected');
    socket.on('setPlayerName', function (player, width, height, playerWidth, playerHeight) {
        if (player.name.length === 0) { //пустое имя недопустимо
            socket.emit('invalidNickname', 'nickname is invalid');
        } else {
            if (findName(player.name) === 0) { //проверяем есть ли игок с таким ником
                players[socket.id] = new Player(player.role, player.name, width, height, playerWidth, playerHeight);
                console.log('a new player ' + player.name + ' is ' + player.role);
                if (player.role === 'Zombie')
                    zombieCount++;
                else
                    humanCount++;
                socket.emit('PlayTheGame', players);
                timerOfPills = setInterval(function () {
                    let p = new Pill(width, height, Constants.PLAYER_WIDTH, Constants.PILL_HEIGHT, Constants.HEALTH_OF_PILL);
                    pills[p.x + '#' + p.y] = p;
                }, 30000);
                timerOfRender = setInterval(function () {
                    try {
                        collisionWithPills();
                        players[socket.id].moveProjectiles();
                        collisionWithProjectile();
                        socket.emit('render', players, pills, epidemicArea);
                        if (!epidemicArea.coordinateFixed)
                            outbreak();
                        else if (epidemicArea.marker)
                            collisionWithEpidemicArea(socket);
                    }
                    catch (error) {
                        if (socket.id in players)
                            throw new error;
                        else console.log("disconnect")
                    }
                }, 20);
            } else socket.emit('usersExists', player.name + ' username is taken! Try some other username.');
        }
    });
    socket.on('increaseEpidemicRadius', function () {
        epidemicArea.increaseRadius();
    })
    socket.on('moveDown', function () {
        let errorName = socket.id;
        try {
            players[socket.id].moveDown();
        } catch (error) {
            if (errorName in players)
                throw new error;
            else console.log("Player disconnected in moveDown");
        }
    });
    socket.on('moveLeft', function () {
        let errorName = socket.id;
        try {
            players[socket.id].moveLeft();
        } catch (error) {
            if (errorName in players)
                throw new error;
            else console.log("Player disconnected in moveLeft");
        }
    });
    socket.on('moveUp', function () {
        let errorName = socket.id;
        try {
            players[socket.id].moveUp();
        } catch (error) {
            if (errorName in players)
                throw new error;
            else console.log("Player disconnected in moveUp")
        }
    });
    socket.on('moveRight', function () {
        let errorName = socket.id;
        try {
            players[socket.id].moveRight();
        } catch (error) {
            if (errorName in players)
                throw new error;
            else console.log("Player disconnected in moveRight");
        }
    });
    socket.on('newProjectile', function (projectile) {
        let errorName = socket.id;
        try {
            if (players[socket.id].isWeaponEmpty()) { //если патроны закончились
                if (!players[socket.id].reloading) { //если оружие не перезаряжается
                    players[socket.id].reloading = true;
                    reload = setTimeout(function () {
                        players[socket.id].countOfBulletInWeapon = players[socket.id].weaponCapacity;
                        players[socket.id].reloading = false;
                    }, 5000);
                }
            } else {
                players[socket.id].shoot();
                if (!projectile.mouseMove) {
                    let pr = new Projectile();
                    players[socket.id].projectiles.unshift(pr.cloneWith(projectile).cloneWith({
                        damage: players[socket.id].projectileDamage,
                        startPoint: new Point(players[socket.id].x + Constants.PLAYER_WIDTH / 2, players[socket.id].y + Constants.PLAYER_HEIGHT / 2)
                    }));
                } else {
                    let player = players[socket.id],
                        points = findPoint(player.x + player.w / 2,
                            player.y + player.h / 2,
                            projectile.mouseX,
                            projectile.mouseY,
                            (player.h * player.h + player.w * player.w) / 4),
                        fP = points.firstPoint,
                        sP = points.secondPoint;
                    if (new Point(projectile.mouseX, projectile.mouseY).findDist(fP)
                        > new Point(projectile.mouseX, projectile.mouseY).findDist(sP)) {
                        let pr = new Projectile();
                        players[socket.id].projectiles.unshift(pr.cloneWith(projectile).cloneWith({
                            x: sP.x,
                            y: sP.y,
                            damage: player.projectileDamage,
                            startPoint: new Point(player.x + Constants.PILL_WIDTH / 2, player.y + Constants.PLAYER_HEIGHT / 2)
                        }));
                    } else {
                        let pr = new Projectile();
                        players[socket.id].projectiles.unshift(pr.cloneWith(projectile).cloneWith({
                            x: fP.x,
                            y: fP.y,
                            damage: player.projectileDamage,
                            startPoint: new Point(player.x + Constants.PLAYER_WIDTH / 2, player.y + Constants.PLAYER_HEIGHT / 2)
                        }));
                    }
                }
            }
        } catch (error) {
            if (errorName in players)
                throw new error;
            else console.log("Player disconnected in newProjectile");
        }
    });
    //добавлям нового игрока  - зомби, событие происходит когда был убит человек
    socket.on('addNewZombie', function (player) {
        players[socket.id] = new Player('Zombie', player.name, player.w, player.h, player.playerWidth, player.playerHeight);
        players[socket.id].x = player.x;
        players[socket.id].y = player.y;
        humanCount--;
        zombieCount++;
    })
    socket.on('disconnect', () => {
        if (socket.id in players) {
            if (players[socket.id].role === 'Zombie')
                zombieCount--;
            else
                humanCount--;
            console.log("Player " + players[socket.id].name + " disconnect");
            delete players[socket.id];
            clearInterval(timerOfPills);
            clearInterval(timerOfRender);
            clearTimeout(reload);
        } else console.log("Player (no name) disconnect");
    });

    //просчитываем получение урона игроком player от снарядов других игроков
    function collisionWithProjectile() {
        let errorName;
        try {
            let player = players[socket.id];
            for (let key in players) {
                errorName = key;
                try {
                    if (key !== socket.id && players[key].role !== player.role) {
                        for (let i = 0; i < players[key].projectiles.length; i++) {
                            let projectile = players[key].projectiles[i];
                            if (player.intersect(projectile)) {
                                // console.log("player - " + players[key].name + " hits player - " + players[socket.id].name);
                                players[socket.id].decreaseHealth(players[key].projectiles[i].damage);//уменьшаем здоровье игрока, по которому попали
                                players[key].projectiles.splice(i, 1);//удалаяем снаряд который попал
                                if (players[socket.id].health === 0) {
                                    if (player.role === 'Zombie') {
                                        clearInterval(timerOfPills); //завершаем создание лекарства от этого пользователя
                                        clearInterval(timerOfRender); //завершаем рендер этого игрока
                                        delete players[socket.id]; //удаляем его из списка игроков
                                        socket.emit('gameOver');
                                        return;
                                    } else {
                                        let x = players[socket.id].x,
                                            y = players[socket.id].y;
                                        delete players[socket.id]; //удаляем его из списка игроков
                                        socket.emit('turningIntoZombie', {x: x, y: y});
                                    }
                                }
                            }
                        }
                    }
                } catch (error) {
                    if (errorName in players) {
                        errorName = socket.id;
                        throw new error;
                    } else console.log("Player disconnected in collisionWithProjectile");
                }
            }
        } catch (error) {
            if (errorName in players)
                throw new error;
            else console.log("Player disconnected in collisionWithProjectile");
        }
    }

    //проверяет какие таблетки подобрал игрок
    function collisionWithPills() {
        let errorName = socket.id;
        try {
            let player = players[socket.id];
            for (let i in pills)
                if (player.intersect(pills[i])) {
                    players[socket.id].increaseHealth(pills[i].health);
                    delete pills[i];
                }
        } catch (error) {
            if (errorName in players)
                throw new error;
            else console.log("Player disconnected in collisionWithPills");
        }
    }
});

app.get('/', function (req, res) {
    res.sendfile('index.html');
});
app.get('/client.js', function (req, res) {
    fs.readFile('client.js', (err, code) => {
        res.writeHead(200, { 'Content-Type': 'text/javascript' });
        res.end(code);
    })
});
app.use('/css', express.static(`${__dirname}/css`));

http.listen(3000, function () {
    console.log('listening on *:3000');
});
