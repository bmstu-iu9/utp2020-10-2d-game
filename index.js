'use strict'
const express = require('express'),
   app = express(),
   http = require('http').createServer(app),
   io = require('socket.io')(http),
   fs = require('fs');
let players = {};
let screenWidth, screenHeight;

class Player {
   constructor(role, name, w, h) {
      this.name = name;
      this.role = role;
      this.x = 0;
      this.y = 0;
      this.allCough = [];
      screenHeight = h;
      screenWidth = w;
   }
}
class Cough {
   constructor(x,y) {
      this.x = x;
      this.y = y;
   }
}
function findName(name) {
   for (let key in players)
      if (players[key].name === name)
         return 1;
   return 0;
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
            let timerId = setInterval(function () {
               moveCough();
               socket.emit('render', players); }, 100);
         } else socket.emit('usersExists', player.name + ' username is taken! Try some other username.');
      }
   });
   socket.on('moveDown', function () {
      if (players[socket.id].y + 105 < screenHeight) {
         players[socket.id].y += 1;
      }
   })
   socket.on('moveLeft', function () {
      if (players[socket.id].x > 0) {
         players[socket.id].x -= 1;
      }
   })
   socket.on('moveUp', function () {
      if (players[socket.id].y > 0) {
         players[socket.id].y -= 1;
      }
   })
   socket.on('moveRight', function () {
      if (players[socket.id].x + 90 < screenWidth) {
         players[socket.id].x += 1;
      }
   })
   socket.on('newCough' , function (cough) {
      players[socket.id].allCough.unshift(new Cough(cough.x,cough.y));
   })
   function moveCough () {
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