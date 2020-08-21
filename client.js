const $ = require('jquery');
const Constants = require('./Constants.js');
const Game = require('./Client/Game.js');
const Chat = require('./Client/Chat.js');
$(document).ready(() => {
    const socket = io();
    const game = Game.create(document, socket);

    game.downloadImages();


    const addNewPlayer = (role) => {
        document.body.innerHTML = '<div id = "nameError"></div><input type = "text" id = "nameOfPlayer" placeholder = "Enter your name">\
          <button type = "button" id = "addPlayer">Set name</button>'
        $('#addPlayer').click(() => {
            let timer;
            const width = document.documentElement.clientWidth * (1 - Constants.CHAT_WIDTH_PERCENT); // ширина клиентской части окна браузера
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
            socket.on(Constants.PLAY, function() {
                document.body.innerHTML = '<canvas id = "game-canvas"></canvas>\
                <div id="game-chat"><input type="text" id="chat-input">\
                <div id="is-typing"></div><div id="chat-display"></div></div>';

                const chatDisplay = document.getElementById('chat-display');
                const chatInput = document.getElementById('chat-input');
                const chatBody = document.getElementById('game-chat');
                const chatTyping = document.getElementById('is-typing');
                const chat = Chat.create(socket, chatInput, chatTyping, chatDisplay, chatBody);


                const canvas = document.getElementById('game-canvas');
                canvas.width = width;
                canvas.height = height;
                const context = canvas.getContext('2d');
                timer = setInterval(function() {
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
                })
                $('#chat-input').focusout(function() {
                    chat.stopTyping();
                })
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