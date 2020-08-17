const $ = require('jquery');
const Constants = require('./Constants.js');
const Game = require('./Client/Game.js');
$(document).ready(() => {
    const socket = io();
    const game = Game.create(document);

    game.downloadImages();


    const addNewPlayer = (role) => {
        document.body.innerHTML = '<div id = "nameError"></div><input type = "text" id = "nameOfPlayer" placeholder = "Enter your name">\
          <button type = "button" id = "addPlayer">Set name</button>'
        $('#addPlayer').click(() => {
            const width = document.documentElement.clientWidth; // ширина клиентской части окна браузера
            const height = document.documentElement.clientHeight; // высота клиентской части окна браузера
            const name = $('#nameOfPlayer').val();
            socket.emit('setPlayerName', { role: role, name: name }, width, height);
            console.log('hello : ' + name + '  ' + role);
            document.body.innerHTML = '<canvas id = "game-canvas"></canvas>';
            game.start($('#game-canvas').getContext('2d'));
        })
    }
    $('#human').click(() => {
        addNewPlayer('Human');
    })
    $('#zombie').click(() => {
        addNewPlayer('Zombie');
    })
})