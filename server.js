const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const Game = require('./Server/Game.js')
const game = new Game();
const Player = require('./Server/Player.js');
const fs = require('fs');
const Constants = require('./Constants.js');


io.on('connection', socket => {
    console.log('user connected');
    socket.on('setPlayerName', function (player, width, height, playerWidth, playerHeight) {
        if (player.name.length === 0) { //пустое имя недопустимо
            socket.emit('invalidNickname', 'nickname is invalid');
        } else {
            if (game.findName(player.name) === 0) { //проверяем есть ли игок с таким ником
                socket.emit(Constants.PLAY);
                game.addPlayer(new Player(player.role, player.name, width, height, playerWidth, playerHeight), socket);
                setInterval(() => {
                    socket.emit(Constants.STATE_UPDATE, {
                        me: player,
                        players: game.players,
                        pills: game.pills,
                        area: game.epidemicArea
                    });
                }, Constants.FRAME_RATE);
                console.log('a new player ' + game.players[socket.id].name + ' is ' + player.role);
            } else socket.emit('usersExists', player.name + ' username is taken! Try some other username.');
        }
    });
    socket.on(Constants.PLAYER_ACTION, function (state) {
        if (state.down) {
            game.players[socket.id].moveDown();
        }
        if (state.left) {
            game.players[socket.id].moveLeft();
        }
        if (state.up) {
            game.players[socket.id].moveUp();
        }
        if (state.right) {
            game.players[socket.id].moveRight();
        }
        if (state.mouse) {
            game.addProjectile(socket, {
                x: game.players[socket.id].x + 80,
                y: game.players[socket.id].y + 65,
                mouseX: state.mouseX,
                mouseY: state.mouseY,
                mouseMove: state.mouseMove,
            });
        }
    })
    socket.on('disconnect', () => {
        if (socket.id in game.players) {
            console.log("Player " + game.players[socket.id].name + " disconnect");
            game.players[socket.id].alive = false;
        } else console.log("Player (no name) disconnect");
    });
});
setInterval(() => {
    game.update();
}, Constants.FRAME_RATE)
setInterval(function () {
    game.addPill();
}, 10000);
app.get('/', function (req, res) {
    res.sendfile('index.html');
});
app.use('/dist', express.static(path.join(__dirname, '/dist')));
app.use('/css', express.static(`${__dirname}/css`));
app.get('/client.js', function (req, res) {
    fs.readFile('client.js', (err, code) => {
        res.writeHead(200, { 'Content-Type': 'text/javascript' });
        res.end(code);
    })
})
http.listen(3000, function () {
    console.log('listening on *:3000');
});