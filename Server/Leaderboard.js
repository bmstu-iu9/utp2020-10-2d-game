const Constants = require('../Constants.js');

class Leaderboard {
    constructor() {
        this.clients = new Map();
        this.sockets = [];
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
        this.sockets.push(socket.id);
    }

    //удаляет пользователя
    removeUser(id) {
        this.clients.delete(id);
        this.sockets.splice(this.sockets.indexOf(id), 1);
    }

    //увеличивает число убитых игроком
    addKill(id) {
        if (this.clients.has(id))
            this.clients.get(id).kills++;
    }

    //увеличивает число превращенных в зомби игроком
    addZombie(id) {
        if (this.clients.has(id))
            this.clients.get(id).zombies++;
    }

    //отправляет текущее состояние клиентам
    sendState() {
        let arr = [];
        this.clients.forEach((client, socketID) => {
            arr.push([socketID, client]);
        });
        arr.sort(function(a, b) {
            return (b[1].kills + b[1].zombies) - (a[1].kills + a[1].zombies)
        });
        this.clients.forEach((client) => {
            let texts = [];
            let text = '';
            for (let i = 0; i < arr.length; i++) {
                let user = arr[i][1];
                text = '<div><p>' + user.name + '</p>' +
                    '<p>Kills: ' + user.kills + ' Zombies: ' + user.zombies + '</p></div>';
                texts.push(text);
            }
            client.socket.emit(Constants.LDB_UPDATE, texts);
        });
    }
}

module.exports = Leaderboard;