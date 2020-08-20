const Constants = require('../Constants.js');

class Chat {
    constructor(socket, input, typing, display, body) {
        this.socket = socket;
        this.input = input;
        this.typing = typing;
        this.display = display;
        this.body = body;
        this.mouseIn = false;
        this.isTyping = false;
    }

    static create(socket, input, typing, display, body) {
        const chat = new Chat(socket, input, typing, display, body);
        chat.init();
        return chat;
    }

    //инициализация
    init() {
        this.input.addEventListener('keydown',
            this.keyDownHandler.bind(this));
        this.socket.on(Constants.NEW_MSG, this.receiveMessage.bind(this));
        this.socket.on(Constants.USER_TYPING, this.type.bind(this));
    }

    //фиксируем что курсор в области чата
    mouseEnter() {
        this.mouseIn = true;
        console.log('chat hover');
    }

    //фиксируем что курсор покинул чат
    mouseLeave() {
        this.mouseIn = false;
        console.log('chat unhover');
    }

    //выводим сообщение о печатающем пользователе
    type(name) {
        if (!this.typing.firstChild) {
            const elem = document.createElement('p');
            elem.id = this.socket.id;
            elem.appendChild(document.createTextNode(name + ' is typing... '));
            this.typing.appendChild(elem);
        }
    }

    //посылаем на сервер информацию о печатающем пользователе и фиксируем фокус на вводе текста
    startTyping() {
        this.isTyping = true;
        this.socket.emit(Constants.USER_TYPING);
        console.log('focus on input');
    }

    //пользователь переключил фокус с ввода текста
    stopTyping() {
        this.isTyping = false;
        const elem = document.getElementById(this.socket.id);
        this.typing.removeChild(elem);
        console.log('focus out input');
    }

    //отправляем сообщение при нажатии Enter
    keyDownHandler(e) {
        if (e.key === "Enter") {
            const elem = document.getElementById(this.socket.id);
            this.typing.removeChild(elem);
            const msg = this.input.value;
            this.typing.children.lenght
            this.input.value = '';
            this.startTyping();
            this.socket.emit(Constants.NEW_MSG, msg);
        }
    }

    //добавляем новое сообщение в чат
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