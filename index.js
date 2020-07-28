'use strict'
const express = require('express'),
   app = express(),
   http = require('http').createServer(app),
   io = require('socket.io')(http),
   fs = require('fs');
let players = {},
   pills = {};
let screenWidth, screenHeight;

class Player {
   constructor(role, name, w, h) {
      this.name = name;
      this.role = role;
      this.x = 0;
      this.y = 0;
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
//движение снарядов - кашля
function moveCough (socket) {
   let dx = 15,
       i = 0;
   while (socket.id in players && i < players[socket.id].allCough.length) {
      if (players[socket.id].x + 200 < players[socket.id].allCough[i].x + dx) {
         players[socket.id].allCough.splice(i, 1);
         --i;
      } else players[socket.id].allCough[i].x += dx;
      ++i;
   }
}
function collisionWithCough() {
   
}
io.on('connection', socket => {
   console.log('user connected');
   socket.on('setPlayerName', function (player, width, height) {
      if (player.name.length === 0) { //пустое имя недопустимо
         socket.emit('invalidNickname', 'nickname is invalid');
      } else {
         if (findName(player.name) === 0) { //проверяем есть ли игок с таким ником
            players[socket.id] = new Player(player.role, player.name, width, height);
            console.log('a new player ' + player.name + ' is ' + player.role);
            socket.emit('PlayTheGame', players);
            setInterval(function () {
               let p = new Pill(width, height);
               pills[p.x + '#' + p.y] = p;
            }, 30000);
            let timerId = setInterval(function () {
               checkGatheredPills();
               moveCough(socket);

               socket.emit('render', players, pills);
            }, 100);
         } else socket.emit('usersExists', player.name + ' username is taken! Try some other username.');
      }
   });
   socket.on('moveDown', function () {
      if (players[socket.id].y + 120 < screenHeight) {
         players[socket.id].y += 5;
      }
   })
   socket.on('moveLeft', function () {
      if (players[socket.id].x > 0) {
         players[socket.id].x -= 5;
      }
   })
   socket.on('moveUp', function () {
      if (players[socket.id].y > 0) {
         players[socket.id].y -= 5;
      }
   })
   socket.on('moveRight', function () {
      if (players[socket.id].x + 90 < screenWidth) {
         players[socket.id].x += 5;
      }
   })
   socket.on('newCough' , function (cough) {
      players[socket.id].allCough.unshift(new Cough(cough.x,cough.y));
   })
   socket.on('disconnect', () => {
      if (socket.id in players) {
         console.log("Player " + players[socket.id].name + " disconnect");
         delete players[socket.id];
      } else console.log("Player (no name) disconnect");
   });
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