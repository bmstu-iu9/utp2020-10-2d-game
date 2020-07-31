'use strict'
const express = require('express'),
   app = express(),
   http = require('http').createServer(app),
   io = require('socket.io')(http),
   fs = require('fs');
let players = {},
    pills = {},
    screenWidth,
    screenHeight;
class Player {
   constructor(role, name, w, h, playerWidth, playerHeight) {
      this.name = name;
      this.role = role;
      this.x = 0;
      this.y = 0;
      this.playerWidth = playerWidth;
      this.playerHeight = playerHeight;
      this.projectiles = [];
      this.health = 1.00;
      if (role === 'Human') {
         this.typeOfWeapon = 'pistol'; //тип оружия
         this.countOfBulletInWeapon = 5; //текущее количесьтво пуль в оружии
         this.weaponCapacity = 5; //максимальная ёмкость в обойме
         this.reloading = false; //показывает находится ли оружие в процессе перезарядки
         this.projectileDamage = 0.10; //урон от пули из оружие игрока
         this.projectileFlightDistance = 400; //дальность полёта пули из оружия игрока
      }
      else {
         this.projectileDamage = 0.05;  //урон от пули из оружие игрока
         this.typeOfWeapon = 'cough'; //тип оружия
         this.projectileFlightDistance = 200; //дальность полёта пули из оружия игрока
      }
      screenHeight = h;
      screenWidth = w;
   }
   isTouchedToPill(x, y) {
      return !(x > this.x + 90 ||
          x + 30 < this.x ||
          y > this.y + 90 ||
          y + 30 < y);
   }
   shoot() {
      if (this.role === 'Zombie') {
         return true;
      }
      else {
         if (this.countOfBulletInWeapon > 0) {
            --this.countOfBulletInWeapon;
            return true;
         }
         else return false;
      }
   }
   isWeaponEmpty() {
      if (this.role === 'Zombie')
         return false;
      else return this.countOfBulletInWeapon === 0;
   }
   increaseHealth() {
      this.health += 0.10;
      if (this.health > 1.00)
         this.health = 1.00;
   }
   decreaseHealth(damage) {
      this.health -= damage;
      if (this.health < 0)
         this.health = 0;
   }
}
//класс снаряда
class Projectile {
   constructor(x,y,projectileWidth,projectileHeight,mouseX,mouseY,mouseMove,type,projectileSpeed,damage) {
      this.x = x;
      this.y = y;
      this.projectileWidth = projectileWidth;
      this.projectileHeight = projectileHeight;
      this.mouseX = mouseX; //координаты мышки в момент выпуска сняряда
      this.mouseY = mouseY; //используяются для определения траектории полёта снаряда
      this.mouseMove = mouseMove;
      this.type = type;
      this.projectileSpeed = projectileSpeed; //скорость снаряда
      this.damage = damage; //урон от попадание этим снарядом
   }
}
//класс точка с координатами в прямоугольной декартовой системе на плоскости
class Point {
   constructor(x,y) {
      this.x = x;
      this.y = y;
   }
}
//класс лекарства
class Pill {
   constructor(w, h) {
      this.x = w * (Math.random() - 90 / w);
      this.y = h * (Math.random() - 90 / h);
   }
}
//поиск имени среди уже существующих на сервере
function findName(name) {
   for (let key in players)
      if (players[key].name === name)
         return 1;
   return 0;
}
//проверяет какие таблетки подобрал игрок
function checkGatheredPills() {
   for (let i in players) {
      for (let j in pills) {
         if (players[i].isTouchedToPill(pills[j].x, pills[j].y)) {
            delete pills[j];
            players[i].increaseHealth();
         }
      }
   }
}
//проверка лежит ли точка в прямоугольнике с вершиной в точке rectP, длиной rectW, шириной rectH
function pointInRect(point,rectP,rectH,rectW) {
   return point.x >= rectP.x && point.x <= rectP.x + rectW && point.y >= rectP.y && point.y <= rectP.y + rectH;
}
//проверка пересекается ли прямоугольник с вершиной в точке firstP, длиной firstPW, шириной firstPH и прямоугльнком second
function twoRectIntersect(firstP,firstPH,firstPW,secondP,secondPH,secondPW) {
   return pointInRect(firstP,secondP,secondPH,secondPW) ||
       pointInRect(new Point(firstP.x + firstPW,firstP.y),secondP,secondPH,secondPW) ||
       pointInRect(new Point(firstP.x,firstP.y + firstPH),secondP,secondPH,secondPW) ||
       pointInRect(new Point(firstP.x + firstPW,firstP.y + firstPH),secondP,secondPH,secondPW);
}
//нахождение расстояние между 2 точками в прямоугольной декартовой системе на плоскости
function findDist(fP,sP) {
   return Math.round(Math.sqrt((sP.x - fP.x) * (sP.x - fP.x) + (sP.y - fP.y) * (sP.y - fP.y)));
}
//движение снарядов - кашля
function moveProjectile(socket) {
   let i = 0;
   while (socket.id in players && i < players[socket.id].projectiles.length) {
      let projectile = players[socket.id].projectiles[i],
          player = players[socket.id],
          dist = projectile.projectileSpeed;
      if (!projectile.mouseMove) {
         if (players[socket.id].x + 200 < players[socket.id].projectiles[i].x + dist) {
            players[socket.id].projectiles.splice(i, 1);
            --i;
         } else players[socket.id].projectiles[i].x += dist;
      } else {
         let points = findPoint(projectile.x, projectile.y, projectile.mouseX, projectile.mouseY, dist*dist),
             fP = points.firstPoint,
             sP = points.secondPoint,
             fDist = findDist(new Point(player.x + player.playerWidth / 2, player.y + player.playerHeight / 2), fP),
             sDist = findDist(new Point(player.x + player.playerWidth / 2, player.y + player.playerHeight / 2), sP);
         if (fDist > sDist)
            if (fDist < player.projectileFlightDistance) {
               players[socket.id].projectiles[i].x = fP.x;
               players[socket.id].projectiles[i].y = fP.y;
            } else players[socket.id].projectiles.splice(i, 1);
         else
            if (sDist < player.projectileFlightDistance) {
               players[socket.id].projectiles[i].x = sP.x;
               players[socket.id].projectiles[i].y = sP.y;
            } else players[socket.id].projectiles.splice(i, 1);
      }
      ++i;
   }
}
//находит пару точек (x,y), которые лежат на расстоянии sqrt(dist) от (x1,y1) и принадлежат прямой (x1,y1) (x2,y2)
function findPoint(x1,y1,x2,y2,dist) {
   let modulYMinusY1 = Math.sqrt(dist * (y2 - y1) * (y2 - y1) / ((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))),
       firstY = modulYMinusY1 + y1,
       firstX = (firstY - y1) * (x2 - x1) / (y2 - y1) + x1,
       secondY = y1 - modulYMinusY1,
       secondX = (secondY - y1) * (x2 - x1) / (y2 - y1) + x1;
   return {firstPoint: new Point(Math.round(firstX), Math.round(firstY)),
      secondPoint: new Point(Math.round(secondX), Math.round(secondY))};
}
io.on('connection', socket => {
   let timerOfPills,
       timerOfRender;
   console.log('user connected');
   socket.on('setPlayerName', function (player, width, height, playerWidth, playerHeight) {
      if (player.name.length === 0) { //пустое имя недопустимо
         socket.emit('invalidNickname', 'nickname is invalid');
      } else {
         if (findName(player.name) === 0) { //проверяем есть ли игок с таким ником
            players[socket.id] = new Player(player.role, player.name, width, height, playerWidth, playerHeight);
            console.log('a new player ' + player.name + ' is ' + player.role);
            socket.emit('PlayTheGame', players);
            timerOfPills = setInterval(function () {
               let p = new Pill(width, height);
               pills[p.x + '#' + p.y] = p;
            }, 30000);
            timerOfRender = setInterval(function () {
               checkGatheredPills();
               moveProjectile(socket);
               collisionWithProjectile();
               socket.emit('render', players, pills);
            }, 100);
         } else socket.emit('usersExists', player.name + ' username is taken! Try some other username.');
      }
   });
   socket.on('moveDown', function () {
      if (players[socket.id].y + 120 < screenHeight) {
         players[socket.id].y += 5;
      }
   });
   socket.on('moveLeft', function () {
      if (players[socket.id].x > 0) {
         players[socket.id].x -= 5;
      }
   });
   socket.on('moveUp', function () {
      if (players[socket.id].y > 0) {
         players[socket.id].y -= 5;
      }
   });
   socket.on('moveRight', function () {
      if (players[socket.id].x + 90 < screenWidth) {
         players[socket.id].x += 5;
      }
   });
   socket.on('newProjectile', function (projectile) {
      if (players[socket.id].isWeaponEmpty()) { //если патроны закончились
         console.log("weapon is empty")
         if (!players[socket.id].reloading) { //если оружие не перезаряжается
            players[socket.id].reloading = true;
            setTimeout(function () {
               players[socket.id].countOfBulletInWeapon = players[socket.id].weaponCapacity;
               players[socket.id].reloading = false;
            }, 5000);
         }
      } else {
         players[socket.id].shoot();
         if (!projectile.mouseMove) {
            players[socket.id].projectiles.unshift
            (new Projectile(projectile.x, projectile.y, projectile.width, projectile.height, projectile.mouseX, projectile.mouseY, projectile.mouseMove, projectile.type, projectile.projectileSpeed,players[socket.id].projectileDamage));
         } else {
            let player = players[socket.id],
                points = findPoint(player.x + player.playerWidth / 2,
                    player.y + player.playerHeight / 2,
                    projectile.mouseX,
                    projectile.mouseY,
                    (player.playerHeight * player.playerHeight + player.playerWidth * player.playerWidth) / 4),
                fP = points.firstPoint,
                sP = points.secondPoint;
            if (findDist(new Point(projectile.mouseX, projectile.mouseY), fP)
                > findDist(new Point(projectile.mouseX, projectile.mouseY), sP))
               players[socket.id].projectiles.unshift
               (new Projectile(sP.x, sP.y, projectile.width, projectile.height, projectile.mouseX, projectile.mouseY, projectile.mouseMove, projectile.type, projectile.projectileSpeed,player.projectileDamage));
            else players[socket.id].projectiles.unshift
            (new Projectile(fP.x, fP.y, projectile.width, projectile.height, projectile.mouseX, projectile.mouseY, projectile.mouseMove, projectile.type, projectile.projectileSpeed,player.projectileDamage));
         }
      }
   });
   socket.on('disconnect', () => {
      if (socket.id in players) {
         console.log("Player " + players[socket.id].name + " disconnect");
         delete players[socket.id];
      } else console.log("Player (no name) disconnect");
   });
   function collisionWithProjectile() {
      let player = players[socket.id];
      for (let key in players) {
         if (key in players && key !== socket.id && players[key].role !== player.role) {
            for (let i = 0; i < players[key].projectiles.length; i++) {
               let projectile = players[key].projectiles[i];
               if (twoRectIntersect({
                  x: projectile.x,
                  y: projectile.y
               }, projectile.projectileHeight, projectile.projectileWidth, {
                  x: player.x,
                  y: player.y
               }, player.playerHeight, player.playerWidth)) {
                  console.log("player - " + players[key].name + " hits player - " + players[socket.id].name);
                  players[socket.id].decreaseHealth(players[key].projectiles[i].damage);//уменьшаем здоровье игрока, по которому попали
                  players[key].projectiles.splice(i, 1);//удалаяем снаряд который попал
                  if (players[socket.id].health === 0) {
                     clearInterval(timerOfPills); //завершаем создание лекарства от этого пользователя
                     clearInterval(timerOfRender); //завершаем рендер этого игрока
                     delete players[socket.id]; //удаляем его из списка игроков
                     socket.emit('gameOver');
                     return;
                  }
               }
            }
         }
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
})
app.use('/css', express.static(`${__dirname}/css`));

http.listen(3000, function () {
   console.log('listening on *:3000');
});