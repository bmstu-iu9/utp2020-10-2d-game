let socket = io(),
    name, //имя игрока
    role, //роль игрока(zombie или human)
    canvas, //холст на котором проходит игра
    context,
    width,
    height,
    rightPressed = false,
    leftPressed = false,
    downPressed = false,
    upPressed = false,
    spacePressed = false,
    coughWidth = 10, //длина
    coughHeight = 10; //ширина
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
function keyDownHandler(e) { //детектит нажатие клавишы
    if (e.key === "d" || e.key === "ArrowRight")
        rightPressed = true;
    else if (e.key === "a" || e.key === "ArrowLeft")
        leftPressed = true;
    else if (e.key === "w" || e.key === "ArrowUp")
        upPressed = true;
    else if (e.key === "s" || e.key === "ArrowDown")
        downPressed = true;
    else if (e.key === " ")
        spacePressed = true;

}
function keyUpHandler(e) { //детектит отпускание клавиши
    if (e.key === "d" || e.key === "ArrowRight")
        rightPressed = false;
    else if (e.key === "a" || e.key === "ArrowLeft")
        leftPressed = false;
    else if (e.key === "w" || e.key === "ArrowUp")
        upPressed = false;
    else if (e.key === "s" || e.key === "ArrowDown")
        downPressed = false;
    else if (e.key === " ")
        spacePressed = false;
}

function setPlayerName() {
    name = document.getElementById('nameOfPlayer').value;
    width = document.documentElement.clientWidth; // ширина клиентской части окна браузера
    height = document.documentElement.clientHeight; // высота клиентской части окна браузера
    console.log('height : ' ,height)
    socket.emit('setPlayerName', { role: role, name: name }, width, height);
}
function addNewPlayer(rl) {
    role = rl;
    document.body.innerHTML = '<div id = "nameError"></div><input type = "text" id = "nameOfPlayer" placeholder = "Enter your name">\
          <button type = "button" name = "button" onclick = "setPlayerName()">Set name</button>'
}
//рисовка экрана пользователя
socket.on('render', function (players) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (leftPressed)
        socket.emit('moveLeft');
    if (rightPressed)
        socket.emit('moveRight');
    if (upPressed)
        socket.emit('moveUp');
    if (downPressed)
        socket.emit('moveDown');
    if (role === "Zombie") {
        if (spacePressed)
            socket.emit('newCough', {x: players[socket.id].x + 80, y: players[socket.id].y + 65})
    }
    drawCough(players);
    drawPlayers(players);
})
//скачиваем все нужные изображения в объект imgs для быстрого доступа
const IMG_NAMES = [
    'halloween.svg',
    'back(1).svg',
    'Virus.png'
];
const imgs = {};
function downloadImage(imageName) {
    return new Promise(resolve => {
        const img = new Image();
        img.src = `/css/${imageName}`;
        img.onload = () => {
            console.log(`Downloaded ${imageName}`);
            imgs[imageName] = img;
            resolve();
        };
    });
}
Promise.all(IMG_NAMES.map(downloadImage)).then(() => console.log('All images downloaded'));
//рисуем снаряды - "кашель"
function drawCough(players) {
    console.log(players[socket.id].allCough.length);
    for (let key in players) {
        console.log(players.length);
        for (let i = 0; i < players[key].allCough.length; i++) {
            context.beginPath();
            context.drawImage(imgs['Virus.png'], players[key].allCough[i].x, players[key].allCough[i].y, coughWidth, coughHeight);
            context.fillStyle = "#dd00d9";
            context.fill();
            context.closePath();
        }
    }
}
//рисуем игроков
function drawPlayers(players) {
    context.font = "12px Arial";
    context.fillStyle = "#0095DD";
    let dy = 15,
        dx = 100;
    for (let key in players) {
        let x = players[key].x,
            y = players[key].y + 12;
        context.fillText(players[key].name + " - " + players[key].role, x, y, 90);
        y += dy;
        if (players[key].role === 'Human') {
            context.drawImage(imgs['back(1).svg'], x, y, 90, 90);
        }
        else {
            context.drawImage(imgs['halloween.svg'], x, y, 90, 90);
        }
        y -= dy;
        //x += dx;
    }
}
socket.on('usersExists', function (data) {//событие происходящие если выбран ник, который уже занят
    console.log(data);
    document.getElementById('nameError').innerHTML = data;
})
socket.on('invalidNickname', function (data) {//если ник некорректный
    console.log(data);
    document.getElementById('nameError').innerHTML = data;
})
socket.on('PlayTheGame', function (players) {
    document.body.innerHTML = '<canvas id = "game-canvas"></canvas>';
    canvas = document.getElementById('game-canvas');
    context = canvas.getContext('2d');
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
})