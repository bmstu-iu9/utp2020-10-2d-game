let socket = io(),
    name,
    role,
    canvas,
    context;
function setPlayerName() {
    name = document.getElementById('nameOfPlayer').value;
    width = document.body.clientWidth; // ширина клиентской части окна браузера
    height = document.body.clientHeight; // высота клиентской части окна браузера
    socket.emit('setPlayerName', { role: role, name: name }, width, height);
}
function addNewPlayer(rl) {
    role = rl;
    document.body.innerHTML = '<div id = "nameError"></div><input type = "text" id = "nameOfPlayer" placeholder = "Enter your name">\
          <button type = "button" name = "button" onclick = "setPlayerName()">Set name</button>'
}
socket.on('render', function (players) {
    context.clearRect(0, 0, canvas.width, canvas.height);
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
        y = 10,
        dx = 100,
        x = 10;
    for (let key in players) {
        context.fillText(players[key].name + " - " + players[key].role, x, y, 90);
        y += dy;
        if (players[key].role === 'Human') {
            context.drawImage(imgs['back(1).svg'], x, y, 90, 90);
        }
        else {
            context.drawImage(imgs['halloween.svg'], x, y, 90, 90);
        }
        y -= dy;
        x += dx;
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