
'use strict'

const express = require('express'),
   app = express(),
   http = require('http').createServer(app),
   io = require('socket.io')(http);
let zombies = [];
let humans = [];
io.on('connection', socket => {
   console.log('user connected');
   socket.on('setPlayerName' , function (player) {
      if (humans.indexOf(player.name) == -1 && zombies.indexOf(player.name) == -1) {
         if (player.name.length == 0)
            socket.emit('usersExists', 'nickname is invalid');
         else {
            if (player.role.localeCompare("Human") == 0)
               humans.push(player.name); //если ник не занят, то добавляем его в список "людей"
            else zombies.push(player.name) //если ник не занят, то добавляем его в список "людей"
            console.log('a new player ' + player.role + 'is ' + player.name);
            socket.emit('PlayTheGame');
         }
      } else socket.emit('usersExists', player.name + ' username is taken! Try some other username.');
   })
   socket.on('disconnect', () => {
      console.log('user disconnected');
   })
})

app.get('/', function (req, res) {
   res.sendfile('index.html');
});
app.use('/css', express.static(`${__dirname}/css`));

http.listen(3000, function () {
   console.log('listening on *:3000');
});