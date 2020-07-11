const express = require('express'),
   app = express(),
   http = require('http').createServer(app),
   io = require('socket.io')(http);

let players = {}; //объект с парами типа id игрока : ник игрока

//генерация псевдослучайного имени из символов ASCII от 32 до 126 включительно
function getRandomName(){
   let name = '';
   for (let i = 0; i < 10; i++){
      name += String.fromCharCode(Math.floor(Math.random() * 95) + 32);
   }
}

io.on('connection', socket => {
   players[socket.id] = getRandomName();
   socket.on('disconnect', () => {
      delete players[socket.id];
   })
})

app.get('/', function (req, res) {
   res.sendfile('index.html');
});
app.use('/css', express.static(`${__dirname}/css`));

http.listen(3000, function () {
   console.log('listening on *:3000');
});
