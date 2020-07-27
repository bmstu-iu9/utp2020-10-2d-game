let socket = io(),
    name,
    role,
    canvas,
    context,
    width,
    height,
    rightPressed = false,
    leftPressed = false,
    downPressed = false,
    upPressed = false;
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
}

function setPlayerName() {
    name = document.getElementById('nameOfPlayer').value;
    width = document.documentElement.clientWidth; // ширина клиентской части окна браузера
    height = document.documentElement.clientHeight; // высота клиентской части окна браузера
    console.log('height : ', height)
    socket.emit('setPlayerName', { role: role, name: name }, width, height);
}
function addNewPlayer(rl) {
    role = rl;
    document.body.innerHTML = '<div id = "nameError"></div><input type = "text" id = "nameOfPlayer" placeholder = "Enter your name">\
          <button type = "button" name = "button" onclick = "setPlayerName()">Set name</button>'
}
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
    drawPlayers(players);
})

//скачиваем все нужные изображения в объект imgs для быстрого доступа
const IMG_NAMES = [
    'halloween.svg',
    'back(1).svg',
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

//рисуем игроков
function drawPlayers(players) {
    context.font = "12px Arial";
    context.fillStyle = "#0095DD";
    let dy = 15,
        dx = 100;
    for (let key in players) {
        let x = players[key].x,
            y = players[key].y + 12,
            text = context.measureText(players[key].name);
        if (text.width <= 90) {
            context.fillText(players[key].name, x + (90 - text.width) / 2, y, 90);
        }
        else{
            context.fillText(players[key].name, x, y, 90);
        }
        y += dy;
        context.fillStyle = "#32CD32";
        context.fillRect(x, y, 90 * players[key].health, 8);
        context.fillStyle = "#B22222";
        context.fillRect(x + 90 * players[key].health, y, 90 * (1 - players[key].health), 8);
        y += dy;
        if (players[key].role === 'Human') {
            context.drawImage(imgs['back(1).svg'], x, y, 90, 90);
        }
        else {
            context.drawImage(imgs['halloween.svg'], x, y, 90, 90);
        }
        y -= 2 * dy;
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