const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const Game = require('./Server/Game.js')
const game = new Game();
const FRAME_RATE = 1000 / 60;
const Player = require('./Server/Player.js');
const fs = require('fs');
io.on('connection', socket => {
    console.log('user connected');
    socket.on('setPlayerName', function (player, width, height, playerWidth, playerHeight) {
        if (player.name.length === 0) { //пустое имя недопустимо
            socket.emit('invalidNickname', 'nickname is invalid');
        } else {
            if (game.findName(player.name) === 0) { //проверяем есть ли игок с таким ником
                socket.emit('PlayTheGame');
                game.addPlayer(new Player(player.role, player.name, width, height, playerWidth, playerHeight) , socket);
                setInterval(() => {
                    socket.emit('render' , game.players,  game.pills , game.epidemicArea);
                }, FRAME_RATE)
                console.log('a new player ' + game.players[socket.id].name + ' is ' + player.role);
            } else socket.emit('usersExists', player.name + ' username is taken! Try some other username.');
        }
    });
    socket.on('increaseEpidemicRadius', function () {
        game.epidemicArea.increaseRadius();
    })
    socket.on('moveDown', function () {
        let errorName = socket.id;
        try {
            game.players[socket.id].moveDown();
        } catch (error) {
            if (errorName in players)
                throw new error;
            else console.log("Player disconnected in moveDown");
        }
    });
    socket.on('moveLeft', function () {
        let errorName = socket.id;
        try {
            game.players[socket.id].moveLeft();
        } catch (error) {
            if (errorName in players)
                throw new error;
            else console.log("Player disconnected in moveLeft");
        }
    });
    socket.on('moveUp', function () {
        let errorName = socket.id;
        try {
            game.players[socket.id].moveUp();
        } catch (error) {
            if (errorName in players)
                throw new error;
            else console.log("Player disconnected in moveUp")
        }
    });
    socket.on('moveRight', function () {
        let errorName = socket.id;
        try {
            game.players[socket.id].moveRight();
        } catch (error) {
            if (errorName in players)
                throw new error;
            else console.log("Player disconnected in moveRight");
        }
    });
    socket.on('newProjectile', function (projectile) {
        game.addProjectile(socket,projectile);
    });
    //добавлям нового игрока  - зомби, событие происходит когда был убит человек
    socket.on('addNewZombie', function (player) {
        players[socket.id] = new Player('Zombie', player.name, player.w, player.h, player.playerWidth, player.playerHeight);
        players[socket.id].x = player.x;
        players[socket.id].y = player.y;
        humanCount--;
        zombieCount++;
    })
    socket.on('disconnect', () => {
        if (socket.id in game.players) {
            console.log("Player " + players[socket.id].name + " disconnect");
            game.players[socket.id].alive = false;
        } else console.log("Player (no name) disconnect");
    });
});
setInterval(() => {
    game.update();
    for(let key in game.clients)
        game.clients.get(key).emit('render' , game.players, game.pills , game.epidemicArea);
}, FRAME_RATE)
setInterval(function () {
    game.addPill();
}, 10000);
app.get('/', function (req, res) {
    res.sendfile('index.html');
});
app.use('/dist' , express.static(path.join(__dirname, '/dist')));
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