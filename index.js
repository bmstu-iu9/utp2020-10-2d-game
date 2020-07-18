'use strict'
const express = require('express'),
   app = express(),
   http = require('http').createServer(app),
   io = require('socket.io')(http);
let players = new Map();
function findName(name) {
   for(let value of players)
      if (value[1].name.localeCompare(name) == 0)
         return 1;
   return 0;
}
io.on('connection', socket => {
   console.log('user connected');
   socket.on('setPlayerName', function (player) {
      if (player.name.length == 0) { //пустое имя недопустимо
         socket.emit('invalidNickname', 'nickname is invalid');
      } else {
         if (findName(player.name) == 0) { //проверяем есть ли игок с таким ником
            players.set(socket.id, {role: player.role, name: player.name});
            console.log('a new player ' + player.name + ' is ' + player.role);
            socket.emit('PlayTheGame');
         } else socket.emit('usersExists', player.name + ' username is taken! Try some other username.');
      }
   });
   socket.on('disconnect', () => {
      if (players.get(socket.id)) {
         console.log("Player " + players.get(socket.id).name + " disconnect");
         players.delete(socket.id);
      } else console.log("Player (no name) disconnect");
   });
});

app.get('/', function (req, res) {
   res.sendfile('index.html');
});
app.use('/css', express.static(`${__dirname}/css`));

http.listen(3000, function () {
   console.log('listening on *:3000');
});