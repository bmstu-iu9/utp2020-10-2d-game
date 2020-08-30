const $ = require('jquery');
const Constants = require('./Constants.js');
const Game = require('./Client/Game.js');
const Chat = require('./Client/Chat.js');
const Leaderboard = require('./Client/Leaderboard.js');
const Lobby = require('./Client/Lobby.js');

$(document).ready(() => {
    const socket = io();
    const game = Game.create(document, socket);
    const lobby = new Lobby();

    game.downloadImages();


    const addNewPlayer = (role) => {
        $('#game-menu').addClass('hidden');
        $('#autenfication').removeClass('hidden');
        $('#addPlayer').click(() => {
            let timer;
            const width = document.documentElement.clientWidth * (1 - Constants.CHAT_WIDTH_PERCENT * 2); // ширина клиентской части окна браузера
            const height = document.documentElement.clientHeight; // высота клиентской части окна браузера
            const name = $('#nameOfPlayer').val();
            socket.emit(Constants.SET_PLAYER_NAME, {
                role: role,
                name: name,
                width: width,
                height: height
            });
            socket.on(Constants.INVALID_NICKNAME, function(data) { //если ник некорректный
                console.log(data);
                document.getElementById('nameError').innerHTML = data;
            })
            socket.on(Constants.USER_EXISTS, function(data) { //событие происходящие если выбран ник, который уже занят
                console.log(data);
                document.getElementById('nameError').innerHTML = data;
            })
            socket.on(Constants.TO_LOBBY, function(name) {
                lobby.init();
                lobby.addUser(name);
            })
            socket.on(Constants.PLAY, function() {
                $('#lobby').addClass('hidden');
                $('#game').removeClass('hidden');

                const chat = Chat.create(socket);
                const leaderboard = Leaderboard.create(socket);

                const canvas = document.getElementById('game-canvas');
                canvas.width = width;
                canvas.height = height;
                const context = canvas.getContext('2d');
                timer = setInterval(function() {
                    canvas.width = document.documentElement.clientWidth * (1 - Constants.CHAT_WIDTH_PERCENT * 2);
                    canvas.height = document.documentElement.clientHeight;
                    game.start(canvas, context, {
                        mouseInChat: chat.mouseIn,
                        inputFocus: chat.isTyping
                    });
                }, Constants.FRAME_RATE);
                $('#game-chat').hover(function() {
                        chat.mouseEnter()
                    },
                    function() {
                        chat.mouseLeave()
                    });
                $('#chat-input').focusin(function() {
                    chat.startTyping();
                });
                $('#chat-input').focusout(function() {
                    chat.stopTyping();
                });
            })
            socket.on(Constants.GAME_OVER, function() {
                clearInterval(timer);
                document.body.innerHTML = '<div> <h1>GAME OVER</h1></div>';
            })
        })
    }
    $('#human').click(() => {
        addNewPlayer(Constants.HUMAN_TYPE);
    })
    $('#zombie').click(() => {
        addNewPlayer(Constants.ZOMBIE_TYPE);
    })
})