const Constants = require('../Constants.js');

class Leaderboard {
    constructor(socket, display) {
        this.socket = socket;
        this.display = display;
    }

    static create(socket, display) {
        const leaderboard = new Leaderboard(socket, display);
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
        for (let i = 0; i < blocks.length; i++)
            this.display.innerHTML += blocks[i];
    }
}

module.exports = Leaderboard;