const $ = require('jquery')
const client = require('./client.js')
const Constants = require('./Constants.js')
$(document).ready(() => {
    const socket = io();
    const addNewPlayer = (role) => {
        document.body.innerHTML = '<div id = "nameError"></div><input type = "text" id = "nameOfPlayer" placeholder = "Enter your name">\
          <button type = "button" id = "addPlayer">Set name</button>'
        $('#addPlayer').click(() => {
            const width = document.documentElement.clientWidth; // ширина клиентской части окна браузера
            const height = document.documentElement.clientHeight; // высота клиентской части окна браузера
            const name  = $('#nameOfPlayer').val();
            socket.emit('setPlayerName', { role: role, name: name }, width, height, Constants.PLAYER_WIDTH, Constants.PLAYER_HEIGHT);
            console.log('hello : ' + name + '  ' + role);
        })
    }
    $('#human').click(() => {
        addNewPlayer('Human');
    })
    $('#zombie').click(() => {
        addNewPlayer('Human');
    })
})