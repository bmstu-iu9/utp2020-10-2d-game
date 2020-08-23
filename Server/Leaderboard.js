const Constants = require('../Constants.js');

class Leaderboard {
    constructor() {
        this.clients = new Map();
    }

    //добавляет нового пользователя
    addUser(socket, player) {
        this.clients.set(socket.id, {
            socket: socket,
            role: player.role,
            name: player.name,
            kills: 0,
            zombies: 0
        });
    }

    //удаляет пользователя
    removeUser(id) {
        delete this.clients[id];
    }

    //увеличивает число убитых игроком
    addKill(id) {
        if (this.clients.has(id))
            this.clients[id].kills++;
    }

    //увеличивает число превращенных в зомби игроком
    addZombie(id) {
        if (this.clients.has(id))
            this.clients[id].zombies++;
    }

    //отправляет текущее состояние клиентам
    sendState() {
        this.clients.forEach((client) => {
            client.socket.emit(Constants.CLEAR_LDB);
            let texts = [];
            let text = '';
            this.clients.forEach((client2) => {
                text = '<div><p>' + client2.name + '</p>' +
                    '<p>Kills: ' + client2.kills + ' Zombies: ' + client2.zombies + '</p></div>';
                texts.push(text);
            });
            client.socket.emit(Constants.LDB_UPDATE, texts);
        });
    }
}

module.exports = Leaderboard;