const $ = require('jquery');
const Constants = require('./Constants.js');
const Game = require('./Client/Game.js');
$(document).ready(() => {
    const socket = io();
    const game = Game.create(document, socket);

    game.downloadImages();


    const addNewPlayer = (role) => {
        document.body.innerHTML = '<div id = "nameError"></div><input type = "text" id = "nameOfPlayer" placeholder = "Enter your name">\
          <button type = "button" id = "addPlayer">Set name</button>'
        $('#addPlayer').click(() => {
            const width = document.documentElement.clientWidth; // ширина клиентской части окна браузера
            const height = document.documentElement.clientHeight; // высота клиентской части окна браузера
            const name = $('#nameOfPlayer').val();
            socket.emit('setPlayerName', { role: role, name: name }, width, height);
            socket.on('invalidNickname', function (data) {//если ник некорректный
                console.log(data);
                document.getElementById('nameError').innerHTML = data;
            })
            socket.on('usersExists', function (data) {//событие происходящие если выбран ник, который уже занят
                console.log(data);
                document.getElementById('nameError').innerHTML = data;
            })
            socket.on(Constants.PLAY, function () {
                document.body.innerHTML = '<canvas id = "game-canvas"></canvas>';
                const canvas = document.getElementById('game-canvas');
                canvas.width = width;
                canvas.height = height;
                const context = canvas.getContext('2d');
                const timer = setInterval(function(){
                    game.start(canvas,context);
                }, Constants.FRAME_RATE);
                
                setTimeout(function () {
                    clearInterval(timer);
                    //game.stop()
                },200000);
            })
        })
    }
    $('#human').click(() => {
        addNewPlayer('Human');
    })
    $('#zombie').click(() => {
        addNewPlayer('Zombie');
    })
})