const Constants = require('../Constants.js');

class Chat {
    constructor(socket, input, body) {
        this.socket = socket;
        this.input = input;
        this.body = body;
    }

    static create(socket, input, body) {
        const chat = new Chat(socket, input, body);
        chat.init();
        return chat;
    }

    init() {
        this.input.addEventListener('keydown',
            this.keyDownHandler.bind(this))
        this.socket.on(Constants.NEW_MSG, this.receiveMessage.bind(this));
    }

    keyDownHandler(e) {
        if (e.key === "Enter") {
            const msg = this.input.value;
            this.input.value = '';
            this.socket.emit(Constants.NEW_MSG, msg);
        }
    }

    receiveMessage(data) {
        const elem = document.createElement('p'),
            firstChild = this.body.firstChild;
        elem.id = this.socket.id;
        elem.appendChild(document.createTextNode(data.name + ': ' + data.msg));
        this.body.insertBefore(elem, firstChild);
        //this.body.appendChild(elem);
        //this.body.scrollIntoView(false);
    }
}

module.exports = Chat;