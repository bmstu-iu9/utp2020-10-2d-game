'use strict'

const express = require('express'),
   app = express(),
   http = require('http').createServer(app),
   io = require('socket.io')(http),
   fs = require('fs');
let players = {},
   humanCount = 0,
   zombieCount = 0,
   pills = {},
   screenWidth,
   screenHeight,
   outbreakRadius = 300,
   pillWidth = 50,
   pillHeight = 50,
   healthOfPill = 0.10;
//используется как родительский класс для объектов типа player, projectile и т.д. для упрощения определения столкновений
class Rect {
   constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.w = width;
      this.h = height;
   }
   leftUp() {
      return new Point(this.x, this.y);
   }
   rightUp() {
      return new Point(this.x + this.w, this.y);
   }
   leftDown() {
      return new Point(this.x, this.y + this.h);
   }
   rightDown() {
      return new Point(this.x + this.w, this.y + this.h);
   }
   //проверка лежит ли точка point в прямоугольнике
   hasPoint(point) {
      return point.x >= this.leftUp().x && point.x <= this.rightUp().x && point.y >= this.leftUp().y && point.y <= this.rightDown().y;
   }
   //проверка пересекается ли прямоугольник this с rect
   intersect(rect) {
      return this.hasPoint(rect.leftUp()) ||
         this.hasPoint(rect.rightUp()) ||
         this.hasPoint(rect.leftDown()) ||
         this.hasPoint(rect.rightDown());
   }
   //проверка пересекается ли прямоугольник this с кругом
   intersectCircle(circle) {
      return circle.hasPoint(this.x, this.y) ||
         circle.intersect(this.x, this.y, this.leftDown.x, this.leftDown.y) ||
         circle.intersect(this.leftDown.x, this.leftDown.y, this.rightDown.x, this.rightDown.y) ||
         circle.intersect(this.rightDown.x, this.rightDown.y, this.rightUp.x, this.rightUp.y) ||
         circle.intersect(this.rightUp.x, this.rightUp.y, this.x, this.y);
   }
}

class Circle {
   constructor(o, r) {
      this.o = o;
      this.radius = r;
   }
   //проверка пересекает ли отрезок окружность this
   intersect(x1, y1, x2, y2) {
      let a = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1),
         b = - 2 * ((x1 - this.o.x) * (x2 - x1) + (y1 - this.o.y) * (y2 - y1)),
         c = (x1 - this.o.x) * (x1 - this.o.x) +
            (y1 - this.o.y) * (y1 - this.o.y) -
            this.radius * this.radius,
         t1 = (- b + Math.sqrt(b * b - 4 * a * c)) / (2 * a),
         t2 = (- b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);

      let curX = x1 + t1 * (x2 - x1);

      if ((x1 <= x2 && curX <= x2 && curX >= x1) ||
         (x1 > x2 && curX <= x1 && curX >= x2))
         return true;
      else {
         curX = x1 + t2 * (x2 - x1);
         if ((x1 <= x2 && curX <= x2 && curX >= x1) ||
            (x1 > x2 && curX <= x1 && curX >= x2))
            return true;
      }
      return false;
   }
   //проверка находится ли точка внутри окружности this
   hasPoint(x, y) {
      return (this.o.x - x) * (this.o.x - x) +
         (this.o.y - y) * (this.o.y - y) <= this.radius * this.radius;
   }
}
class Player extends Rect {
   constructor(role, name, w, h, playerWidth, playerHeight) {
      super(0, 0, playerWidth, playerHeight);
      this.name = name;
      this.role = role;
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
}

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
//класс точка с координатами в прямоугольной декартовой системе на плоскости\
class Point {
   constructor(x, y) {
      this.x = x;
      this.y = y;
   }
}
//класс лекарства
class Pill extends Rect {
   constructor(w, h, pillWidth, pillHeight, health) {
      super(w * (Math.random() - 90 / w), h * (Math.random() - 90 / h), pillWidth, pillHeight);
      this.health = health;
   }
}

//поиск имени среди уже существующих на сервере
function findName(name) {
   for (let key in players)
      if (players[key].name === name)
         return 1;
   return 0;
}
//нахождение расстояние между 2 точками в прямоугольной декартовой системе на плоскости
function findDist(fP, sP) {
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
         let points = findPoint(projectile.x, projectile.y, projectile.mouseX, projectile.mouseY, dist * dist),
            fP = points.firstPoint,
            sP = points.secondPoint,
            fDist = findDist(new Point(player.x + player.w / 2, player.y + player.h / 2), fP),
            sDist = findDist(new Point(player.x + player.w / 2, player.y + player.h / 2), sP);
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
   return ((humanCount > zombieCount) && (humanCount - zombieCount > 2));
}

//возвращает точку с координатами около рандомного игрока, являющегося человеком
function randomHuman() {
   let keys = Object.keys(players);
   let curPlayer = players[keys[Math.floor(Math.random() * keys.length)]];
   while (curPlayer.role !== 'Human')
      curPlayer = players[keys[Math.floor(Math.random() * keys.length)]];
   return new Point(Math.round(curPlayer.x - 50), Math.round(curPlayer.y - 50));
}
//вспышка эпидемии случается рядом со случайным человеком
function outbreak(center, socket) {
   let epidemicArea = new Circle(center, outbreakRadius);
   for (let key in players) {
      if (players[key].role === 'Human' &&
         players[key].intersectCircle(epidemicArea)) { //люди, которых задело
         let x = players[key].x,
            y = players[key].y;
         delete players[key];
         socket.emit('turningIntoZombie', { x: x, y: y }); //превращаются в зомби
      }
   }
}

function balance(socket) {
   if (demographicImbalance()) {
      console.log('we need more zombie! Zombie: ' + zombieCount + ' Human: ' + humanCount);
      let c = randomHuman();
      setTimeout(function () { outbreak(c, socket) }, 5000); //оставляем возможность выбранному игроку выбраться из зоны поражения
   }
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
            if (player.role === 'Zombie')
               zombieCount++;
            else
               humanCount++;
            socket.emit('PlayTheGame', players);
            timerOfPills = setInterval(function () {
               let p = new Pill(width, height, pillWidth, pillHeight, healthOfPill);
               pills[p.x + '#' + p.y] = p;
            }, 30000);
            timerOfRender = setInterval(function () {
               collisionWithPills();
               moveProjectile(socket);
               collisionWithProjectile();
               balance(socket);

               socket.emit('render', players, pills);
            }, 20);
         } else socket.emit('usersExists', player.name + ' username is taken! Try some other username.');
      }
   });
   socket.on('moveDown', function () {
      if (players[socket.id].y + 120 < screenHeight) {
         players[socket.id].y += 2;
      }
   });
   socket.on('moveLeft', function () {
      if (players[socket.id].x > 0) {
         players[socket.id].x -= 2;
      }
   });
   socket.on('moveUp', function () {
      if (players[socket.id].y > 0) {
         players[socket.id].y -= 2;
      }
   });
   socket.on('moveRight', function () {
      if (players[socket.id].x + 90 < screenWidth) {
         players[socket.id].x += 2;
      }
   });
   socket.on('newProjectile', function (projectile) {
      if (players[socket.id].isWeaponEmpty()) { //если патроны закончились
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
            let pr = new Projectile();
            players[socket.id].projectiles.unshift(pr.cloneWith(projectile).cloneWith({ damage: players[socket.id].projectileDamage }));
         } else {
            let player = players[socket.id],
               points = findPoint(player.x + player.w / 2,
                  player.y + player.h / 2,
                  projectile.mouseX,
                  projectile.mouseY,
                  (player.h * player.h + player.w * player.w) / 4),
               fP = points.firstPoint,
               sP = points.secondPoint;
            if (findDist(new Point(projectile.mouseX, projectile.mouseY), fP)
               > findDist(new Point(projectile.mouseX, projectile.mouseY), sP)) {
               let pr = new Projectile();
               players[socket.id].projectiles.unshift(pr.cloneWith(projectile).cloneWith({
                  x: sP.x,
                  y: sP.y,
                  damage: player.projectileDamage
               }));
            } else {
               let pr = new Projectile();
               players[socket.id].projectiles.unshift(pr.cloneWith(projectile).cloneWith({
                  x: fP.x,
                  y: fP.y,
                  damage: player.projectileDamage
               }));
            }
         }
      }
   });
   //добавлянм нового игрока  - зомби, событие происходит когда был убит человек
   socket.on('addNewZombie', function (player) {
      players[socket.id] = new Player('Zombie', player.name, player.w, player.h, player.playerWidth, player.playerHeight);
      players[socket.id].x = player.x;
      players[socket.id].y = player.y;
      humanCount--;
      zombieCount++;
   })
   socket.on('disconnect', () => {
      if (socket.id in players) {
         if (player.role === 'Zombie')
               zombieCount--;
            else
               humanCount--;
         console.log("Player " + players[socket.id].name + " disconnect");
         delete players[socket.id];
         clearInterval(timerOfPills);
         clearInterval(timerOfRender);

      } else console.log("Player (no name) disconnect");
   });

   //просчитываем получение урона игроком player от снарядов других игроков
   function collisionWithProjectile() {
      let player = players[socket.id];
      for (let key in players) {
         if (socket.id in players && key in players && key !== socket.id && players[key].role !== player.role) {
            for (let i = 0; i < players[key].projectiles.length; i++) {
               let projectile = players[key].projectiles[i];
               if (player.intersect(projectile)) {
                  console.log("player - " + players[key].name + " hits player - " + players[socket.id].name);
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
                        socket.emit('turningIntoZombie', { x: x, y: y });
                     }
                  }
               }
            }
         }
      }
   }

   //проверяет какие таблетки подобрал игрок
   function collisionWithPills() {
      let player = players[socket.id];
      for (let i in pills)
         if (player.intersect(pills[i])) {
            players[socket.id].increaseHealth(pills[i].health);
            delete pills[i];
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
