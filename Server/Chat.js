const Constants = require('../Constants.js');

class Chat {
    constructor() {
        this.typing = []; //печатающие в чате пользователи
    }

    //добавляет к списку печатающих игроков
    addTyping(player) {
        if (!this.typing.includes(player.name))
            this.typing.push(player.name);
    }

    //удаляет из списка печатающих игроков
    removeTyping(player) {
        if (this.typing.includes(player.name))
            this.typing.splice(this.typing.indexOf(player.name), 1);
    }

    //отправляет текущее состояние клиентам
    sendState(clients) {
        clients.forEach((client, socketID) => {
            clients.get(socketID).emit(Constants.USER_TYPING, this.typing);
        });
    }

    static sendNote(data, clients) {
        clients.forEach((client, socketID) => {
            clients.get(socketID).emit(Constants.NEW_NOTE, data);
        });
    }
}

module.exports = Chat;