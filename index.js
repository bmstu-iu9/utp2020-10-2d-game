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
      this.allCough = [];
      if (role == 'Human')
         this.health = 1.00;
      else
         this.health = 0.00;
      screenHeight = h;
      screenWidth = w;
   }
   isTouchedToPill(x, y) {
      return !(x > this.x + 90 ||
          x + 30 < this.x ||
          y > this.y + 90 ||
          y + 30 < y);

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
class Cough {
   constructor(x,y,coughWidth,coughHeight,mouseX,mouseY,mouseMove) {
      this.x = x;
      this.y = y;
      this.coughWidth = coughWidth;
      this.coughHeight = coughHeight;
      this.mouseX = mouseX;
      this.mouseY = mouseY;
      this.mouseMove = mouseMove;
   }
}
class Point {
   constructor(x,y) {
      this.x = x;
      this.y = y;
   }
}
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
//нахождение расстояние между 2 точками
function findDist(fP,sP) {
   return Math.round(Math.sqrt((sP.x - fP.x) * (sP.x - fP.x) + (sP.y - fP.y) * (sP.y - fP.y)));
}
//движение снарядов - кашля
function moveCough (socket) {
   let dx = 15,
       i = 0;
   while (socket.id in players && i < players[socket.id].allCough.length) {
      let cough = players[socket.id].allCough[i],
          player = players[socket.id];
      if (!cough.mouseMove) {
         if (players[socket.id].x + 200 < players[socket.id].allCough[i].x + dx) {
            players[socket.id].allCough.splice(i, 1);
            --i;
         } else players[socket.id].allCough[i].x += dx;
      } else {
         let points = findPoint(cough.x, cough.y, cough.mouseX, cough.mouseY, dx * dx),
             fP = points.firstPoint,
             sP = points.secondPoint,
             fDist = findDist(new Point(player.x + player.playerWidth / 2, player.y + player.playerHeight / 2), fP),
             sDist = findDist(new Point(player.x + player.playerWidth / 2, player.y + player.playerHeight / 2), sP);
         if (fDist > sDist)
            if (fDist < 200) {
               players[socket.id].allCough[i].x = fP.x;
               players[socket.id].allCough[i].y = fP.y;
            } else players[socket.id].allCough.splice(i, 1);
         else
            if (sDist < 200) {
               players[socket.id].allCough[i].x = sP.x;
               players[socket.id].allCough[i].y = sP.y;
            } else players[socket.id].allCough.splice(i, 1);
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
               moveCough(socket);
               if (players[socket.id].role === 'Human')
                  collisionWithCough();
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
   socket.on('newCough', function (cough) {
      // console.log(cough.mouseX + " " + cough.mouseY)
      if (!cough.mouseMove) {
         players[socket.id].allCough.unshift(new Cough(cough.x, cough.y, cough.width, cough.height, cough.mouseX, cough.mouseY, cough.mouseMove));
      } else {
         let player = players[socket.id],
             points = findPoint(player.x + player.playerWidth / 2,
                 player.y + player.playerHeight / 2,
                 cough.mouseX,
                 cough.mouseY,
                 (player.playerHeight * player.playerHeight + player.playerWidth * player.playerWidth)/4),
             fP = points.firstPoint,
             sP = points.secondPoint;
         if (findDist(new Point(cough.mouseX, cough.mouseY), fP)
             > findDist(new Point(cough.mouseX, cough.mouseY), sP))
            players[socket.id].allCough.unshift(new Cough(sP.x, sP.y, cough.width, cough.height, cough.mouseX, cough.mouseY, cough.mouseMove));
         else players[socket.id].allCough.unshift(new Cough(fP.x, fP.y, cough.width, cough.height, cough.mouseX, cough.mouseY, cough.mouseMove));
      }
   });
   socket.on('disconnect', () => {
      if (socket.id in players) {
         console.log("Player " + players[socket.id].name + " disconnect");
         delete players[socket.id];
      } else console.log("Player (no name) disconnect");
   });
   function collisionWithCough() {
      let player = players[socket.id];
      for (let key in players) {
         if (key !== socket.id && players[key].role === 'Zombie') {
            for (let i = 0; i < players[key].allCough.length; i++) {
               let cough = players[key].allCough[i];
               if ((cough.x >= player.x && cough.x <= player.x + player.playerWidth && cough.y >= player.y && cough.y <= player.y + player.playerHeight) || //проверяем попадание верхнего левого края модельки кашля в модельку игрока
                   (cough.x + cough.coughWidth >= player.x && cough.x + cough.coughWidth <= player.x + player.playerWidth && cough.y >= player.y && cough.y <= player.y + player.playerHeight) || //врехнего правого угла
                   (cough.x >= player.x && cough.x <= player.x + player.playerWidth && cough.y + cough.coughHeight >= player.y && cough.y + cough.coughHeight <= player.y + player.playerHeight) || //левый нижний
                   (cough.x + cough.coughWidth >= player.x && cough.x + cough.coughWidth <= player.x + player.playerWidth && cough.y + cough.coughHeight >= player.y && cough.y + cough.coughHeight <= player.y + player.playerHeight)) { //правый нижний
                  console.log("player - " + players[key].name + " hits player - " + players[socket.id].name);
                  players[key].allCough.splice(i, 1);//удалаяем снаряд кашля который попал
                  players[socket.id].decreaseHealth(0.05);//уменьшаем здоровье игрока, по которому попали
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