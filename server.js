const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const Game = require('./Server/Game.js');
const game = new Game();
const fs = require('fs');
const Constants = require('./Constants.js');


io.on(Constants.CONNECT, socket => {
    console.log('user connected');
    socket.on(Constants.SET_PLAYER_NAME, function (player) {
        if (player.name.length === 0) { //пустое имя недопустимо
            socket.emit(Constants.INVALID_NICKNAME, 'nickname is invalid');
        } else {
            if (game.findName(player.name) === 0) { //проверяем есть ли игок с таким ником
                game.addPlayer(player, socket);
                socket.emit(Constants.PLAY);
                let note = 'A new player is ' + player.name;
                game.sendNote(note);
                console.log('a new player ' + game.players[socket.id].name + ' is ' + player.role);
            } else socket.emit(Constants.USER_EXISTS, player.name + ' username is taken! Try some other username.');
        }
    });
    socket.on(Constants.PLAYER_ACTION, function (state) {
        game.updatePlayerOnInput(socket.id, state);
    });
    socket.on(Constants.USER_TYPING, function () {
        game.addTyping(socket.id)
    });
    socket.on(Constants.STOP_TYPING, function () {
        game.removeTyping(socket.id);
    });
    socket.on(Constants.NEW_MSG, function (msg) {
        game.sendMessage(socket.id, msg);
    });
    socket.on(Constants.DISCONNECT, () => {
        if (socket.id in game.players) {
            console.log("Player " + game.players[socket.id].name + " disconnect");
            game.players[socket.id].alive = false;
            chat.removeTyping(game.players[socket.id]);
            let note = game.players[socket.id].name + ' left the game:('
            game.sendNote(note);
        } else console.log("Player (no name) disconnect");
    });
});
setInterval(() => {
    game.update();
    game.sendState();
}, Constants.FRAME_RATE);
setInterval(function() {
    game.addPill();
}, 10000);
app.get('/', function(req, res) {
    res.sendfile('index.html');
});
app.use('/dist', express.static(path.join(__dirname, '/dist')));
app.use('/css', express.static(`${__dirname}/css`));
app.get('/client.js', function(req, res) {
    fs.readFile('client.js', (err, code) => {
        res.writeHead(200, {
            'Content-Type': 'text/javascript'
        });
        res.end(code);
    })
})
http.listen(3000, function() {
    console.log('listening on *:3000');
});