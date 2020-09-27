const $ = require('jquery');

class Lobby {
    constructor() {
        this.list = document.getElementById('lobby-list');
    }

    init(users) {
        $('#autenfication').addClass('hidden');
        $('#lobby').removeClass('hidden');
        for (let i = 0; i < users.length; i++) {
            this.list.innerHTML += '<li>' + users[i] + '</li>';
        }
    }

    add(name) {
        this.list.innerHTML += '<li>' + name + '</li>';
    }
}

module.exports = Lobby;