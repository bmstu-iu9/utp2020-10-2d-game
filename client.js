let socket = io(),
    name, //имя игрока
    role, //роль игрока(zombie или human)
    canvas, //холст на котором проходит игра
    context,
    width,
    height,
    rightPressed = false,//проверяет нажата ли хотя бы 1 из кнопок движения вправа(d или стреловка вправо), true - нажата, false - не нажата
    leftPressed = false,//проверяет нажата ли хотя бы 1 из кнопок движения влево(a или стреловка влево), true - нажата, false - не нажата
    downPressed = false,//проверяет нажата ли хотя бы 1 из кнопок движения вниз(s или стреловка вниз), true - нажата, false - не нажата
    upPressed = false,//проверяет нажата ли хотя бы 1 из кнопок движения вверх(w или стреловка вверх), true - нажата, false - не нажата
    spacePressed = false,//проверяет нажат ли пробел , true - нажат, false - не нажат
    coughWidth = 10, //длина снаряда кашя
    coughHeight = 10, //ширина снаряда кашля
    playerWidth = 90, //длина прямоугольника модельки человека
    playerHeight = 90, //ширина прямоугольника модельки человека
    mouseX = 0, //X кооордината положения мыши
    mouseY = 0, //Y кооордината положения мыши
    mouseMove = false, //перемещалась ли мышь
    mousePressed = false, //нажата ли кнопка мыши
    bulletWidth = 10, //длина модельки пули
    bulletHeight = 10, //ширина модельки пули
    speedOfCough = 5, //скорость полёта кашля
    speedOfBullet = 10; //скорость полёта пули
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("mousedown", mouseDownHandler, false);
document.addEventListener("mouseup", mouseUpHandler, false);
//детектит нажатие кнопки мыши
function mouseDownHandler() {
    mousePressed = true;
}
//детектит отпускание кнопки мыши
function mouseUpHandler() {
    mousePressed = false;
}
function mouseMoveHandler(event) {
    mouseMove = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
}
//детектит нажатие клавишы
function keyDownHandler(e) {
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
//детектит отпускание клавиши
function keyUpHandler(e) {
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
    console.log('height : ', height)
    socket.emit('setPlayerName', { role: role, name: name }, width, height , playerWidth , playerHeight);
}
function addNewPlayer(rl) {
    role = rl;
    document.body.innerHTML = '<div id = "nameError"></div><input type = "text" id = "nameOfPlayer" placeholder = "Enter your name">\
          <button type = "button" name = "button" onclick = "setPlayerName()">Set name</button>'
}
//рисовка экрана пользователя
socket.on('render', function (players, pills) {
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
        if (mousePressed)
            socket.emit('newProjectile', {
                x: players[socket.id].x + 80,
                y: players[socket.id].y + 65,
                projectileWidth: coughWidth,
                projectileHeight: coughHeight,
                mouseX: mouseX,
                mouseY: mouseY,
                mouseMove: mouseMove,
                type: 'cough',
                projectileSpeed: speedOfCough
            })
    } else if (mousePressed)
        socket.emit('newProjectile', {
            x: players[socket.id].x + 80,
            y: players[socket.id].y + 65,
            projectileWidth: bulletWidth,
            projectileHeight: bulletHeight,
            mouseX: mouseX,
            mouseY: mouseY,
            mouseMove: mouseMove,
            type: 'bullet',
            projectileSpeed: speedOfBullet
        })
    drawProjectiles(players);
    drawPlayers(players);
    drawPills(pills);
})
//скачиваем все нужные изображения в объект imgs для быстрого доступа
const IMG_NAMES = [
    'Zombie.svg', //Zombie
    'Human.svg', //Human
    'Virus.png',//моделька снарядов - кашля
    'medicinedrawn.svg',
    'Bullet.png'
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
function drawProjectiles(players) {
    for (let key in players) {
        for (let i = 0; i < players[key].projectiles.length; i++) {
            context.beginPath();
            if (players[key].projectiles[i].type === 'cough') {
                context.drawImage(imgs['Virus.png'], players[key].projectiles[i].x, players[key].projectiles[i].y, coughWidth, coughHeight);
                context.fillStyle = "#dd00d9";
                context.fill();
                context.closePath();
            } else {
                context.drawImage(imgs['Bullet.png'], players[key].projectiles[i].x, players[key].projectiles[i].y, bulletWidth, bulletHeight);
                context.fillStyle = "#dd00d9";
                context.fill();
                context.closePath();
            }
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
            y = players[key].y + 12,
            text = context.measureText(players[key].name);
        if (text.width <= 90) {
            context.fillText(players[key].name, x + (90 - text.width) / 2, y, 90);
        }
        else {
            context.fillText(players[key].name, x, y, 90);
        }
        y += dy;
        context.fillStyle = "#000000";
        context.fillRect(x, y, 90, 8);
        context.fillStyle = "#32CD32";
        context.fillRect(x + 1, y + 1, 88 * players[key].health, 6);
        context.fillStyle = "#B22222";
        context.fillRect(x + 1 + 88 * players[key].health, y + 1, 88 * (1 - players[key].health), 6);
        y += dy;
        if (players[key].role === 'Human') {
            context.drawImage(imgs['Human.svg'], x, y, playerWidth, playerHeight);
        }
        else {
            context.drawImage(imgs['Zombie.svg'], x, y, playerWidth, playerHeight);
        }
        y -= 2 * dy;
        //x += dx;
    }
}

//рисуем лекарство в рандомной точке
function drawPills(pills) {
    for (let i in pills){
        context.drawImage(imgs['medicinedrawn.svg'], pills[i].x, pills[i].y,50,50);
    }
}
//при смерти человека вызывается это событие
socket.on('turningIntoZombie' , function (coordinates) {
    role = 'Zombie';
    socket.emit('addNewZombie', {
        name: name,
        w: width,
        h: height,
        playerWidth: playerWidth,
        playerHeight: playerHeight,
        x: coordinates.x,
        y: coordinates.y
    });
})
socket.on('gameOver' , function () {
    document.body.innerHTML = '<div> <h1>GAME OVER</h1></div>'
})
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