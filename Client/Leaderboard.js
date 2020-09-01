const Constants = require('../Constants.js');

class Leaderboard {
    constructor(socket) {
        this.socket = socket;
        this.display = document.getElementById('leaderboard');
    }

    static create(socket) {
        const leaderboard = new Leaderboard(socket);
        leaderboard.init();
        return leaderboard;
    }

    init() {
        this.socket.on(Constants.LDB_UPDATE, this.update.bind(this));
        this.socket.on(Constants.CLEAR_LDB, this.clear.bind(this));
    }

    //очищаем перед обновлением
    clear() {
        this.display.innerHTML = '';
    }

    //обновляем
    update(blocks) {
        this.clear();
        for (let i = 0; i < blocks.length; i++)
            this.display.innerHTML += blocks[i];
    }
}

module.exports = Leaderboard;