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
        this.clients.forEach((client, socketID) => {
            this.clients.get(socketID).emit(Constants.USER_TYPING, this.typing);
        });
    }
}

module.exports = Chat;