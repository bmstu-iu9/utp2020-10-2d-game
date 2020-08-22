const Constants = require('../Constants.js');

class Chat {
    constructor() {
        this.clients = new Map();
        this.typing = []; //печатающие в чате пользователи
    }

    //добавляет нового пользователя
    addUser(socket) {
        this.clients.set(socket.id, socket);
    }
    removeUser(id) {
        delete this.clients[id];
    }
    //добавляет к списку печатающих игроков
    addTyping(player) {
        if (!this.typing.includes(player.name))
            this.typing.push(player.name);
    }

    //удаляет из списка печатающих игроков
    removeTyping(player) {
        this.typing.splice(this.typing.indexOf(player.name), 1);
    }

    //отправляет текущее состояние клиентам
    sendState() {
        this.clients.forEach((client) => {
            client.emit(Constants.USER_TYPING, this.typing);
        });
    }

    static sendNote(data, clients) {
        clients.forEach((client) => {
            client.emit(Constants.NEW_NOTE, data);
        });
    }
}

module.exports = Chat;