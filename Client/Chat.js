const Constants = require('../Constants.js');

class Chat {
    constructor(socket, input, display, body) {
        this.socket = socket;
        this.input = input;
        this.display = display;
        this.body = body;
        this.mouseIn = false;
        this.isTyping = false;
    }

    static create(socket, input, display, body) {
        const chat = new Chat(socket, input, display, body);
        chat.init();
        return chat;
    }

    init() {
        this.input.addEventListener('keydown',
            this.keyDownHandler.bind(this));
        this.socket.on(Constants.NEW_MSG, this.receiveMessage.bind(this));
    }

    mouseEnter() {
        this.mouseIn = true;
        console.log('chat hover');
    }

    mouseLeave() {
        this.mouseIn = false;
        console.log('chat unhover');
    }

    startTyping() {
        this.isTyping = true;
        console.log('focus on input');
    }

    stopTyping() {
        this.isTyping = false;
        console.log('focus out input');
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
            firstChild = this.display.firstChild;
        elem.id = this.socket.id;
        elem.appendChild(document.createTextNode(data.name + ': ' + data.msg));
        this.display.insertBefore(elem, firstChild);
        //this.body.appendChild(elem);
        //this.body.scrollIntoView(false);
    }
}

module.exports = Chat;