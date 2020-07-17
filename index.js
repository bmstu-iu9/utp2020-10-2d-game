
'use strict'

const express = require('express'),
   app = express(),
   http = require('http').createServer(app),
   io = require('socket.io')(http);
let zombies = []
let humans = []
io.on('connection', socket => {
   console.log('user connected');
   socket.on('setHumanName' , function (name) {
      if (humans.indexOf(name) == -1) {
         humans.push(name)
         console.log('a new player is ' + name)
         socket.emit('PlayTheGame')
      } else {
         console.log(name)
         socket.emit('usersExists', name + ' username is taken! Try some other username.');
      }
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