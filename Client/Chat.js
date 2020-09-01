const Constants = require('../Constants.js');

class Chat {
    constructor(socket) {
        this.socket = socket;
        this.input = document.getElementById('chat-input');
        this.typing = document.getElementById('is-typing');
        this.display = document.getElementById('chat-display');
        this.body = document.getElementById('game-chat');
        this.note = document.getElementById('notifications');
        this.mouseIn = false;
        this.isTyping = false;
    }

    static create(socket) {
        const chat = new Chat(socket);
        chat.init();
        return chat;
    }

    //инициализация
    init() {
        this.input.addEventListener('keydown',
            this.keyDownHandler.bind(this));
        const elem = document.createElement('p');
        elem.appendChild(document.createTextNode(''));
        this.typing.appendChild(elem);
        this.socket.on(Constants.NEW_MSG, this.receiveMessage.bind(this));
        this.socket.on(Constants.USER_TYPING, this.type.bind(this));
        this.socket.on(Constants.NEW_NOTE, this.receiveNote.bind(this));
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
    type(names) {
        const elem = this.typing.firstChild;
        if (names.length === 0) {
            elem.innerHTML = '';
        }
        if (names.length === 1) {
            elem.innerHTML = names[0] + ' is typing...';
        } else {
            let text = ''
            for (let i = 0; i < names.length; i++) {
                i === names.length - 1 ?
                    text += names[i] + ' are typing...' :
                    text += names[i] + ', ';
            }
            elem.innerHTML = text;
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
        this.socket.emit(Constants.STOP_TYPING);
        console.log('focus out input');
    }

    //отправляем сообщение при нажатии Enter
    keyDownHandler(e) {
        if (e.key === "Enter" && this.input.value != '') {
            const msg = this.input.value;
            this.input.value = '';
            this.startTyping();
            this.socket.emit(Constants.NEW_MSG, msg);
        }
    }

    //добавляем новое сообщение в чат
    receiveMessage(data) {
        const elem = document.createElement('div'),
            firstChild = this.display.firstChild;
        elem.id = this.socket.id;
        elem.appendChild(document.createTextNode(data.name + ': ' + data.msg));
        this.display.insertBefore(elem, firstChild);
    }

    //добавляем новое уведомление
    receiveNote(data) {
        const elem = document.createElement('p'),
            firstChild = this.note.firstChild;
        elem.id = this.socket.id;
        elem.appendChild(document.createTextNode(data));
        this.note.insertBefore(elem, firstChild);
    }
}

module.exports = Chat;