
'use strict'

const express = require('express'),
   app = express(),
   http = require('http').createServer(app),
   io = require('socket.io')(http);

io.on('connection', socket => {
   console.log('user connected');
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