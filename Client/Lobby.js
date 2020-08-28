const $ = require('jquery');

class Lobby {
    constructor() {
        this.list = document.getElementById('lobby-list');
    }

    init() {
        $('#autenfication').addClass('hidden');
        $('#lobby').removeClass('hidden');
    }

    addUser(name) {
        this.list.innerHTML += '<li>' + name + '</li>';
    }
}

module.exports = Lobby;