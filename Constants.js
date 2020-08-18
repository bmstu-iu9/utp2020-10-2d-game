module.exports = Object.freeze({
    ZOMBIE_MAX_HEALTH: 1.00,
    HUMAN_MAX_HEALTH: 1.00,
    SPEED_OF_COUGH: 5, //скорость полёта кашля
    SPEED_OF_BULLET: 10, //скорость полёта пули
    BULLET_WIDTH: 10, //длина модельки пули
    BULLET_HEIGHT: 10, //ширина модельки пули
    COUGH_WIDTH: 10, //длина снаряда кашя
    COUGH_HEIGHT: 10, //ширина снаряда кашля
    PLAYER_WIDTH: 90, //длина прямоугольника модельки человека
    PLAYER_HEIGHT: 90, //ширина прямоугольника модельки человека
    PILL_WIDTH: 50, //длина прямоугльника модельки лекарства
    PILL_HEIGHT: 50, //ширина прямоугольника модельки лекарства
    HEALTH_OF_PILL: 0.10, //лечение от лекарства
    COUGH_FLIGHT_DISTANCE: 200, //дальность кашля
    BULLET_FLIGHT_DISTANCE: 400, //дальность кашля
    IMG_NAMES: [
        'Zombie.svg', //Zombie
        'Human.svg', //Human
        'Virus.png',//моделька снарядов - кашля
        'medicinedrawn.svg', //лекарство
        'Bullet.png' //пуля
    ],
    STATE_UPDATE: 'update',
    PLAYER_ACTION: 'playerAction',
    PLAY: 'playTheGame',
    RELOAD_PISTOL: 5000, //длительность перезарядки пистолета
    TYPE_BULLET: 'bullet',
    TYPE_COUGH: 'cough',
    BULLET_DAMAGE: 0.10, //урон от пули
    COUGH_DAMAGE: 0.05, //урон от кашля
    MAX_RADIUS_OF_EPIDEMIC_AREA: 100,
    FRAME_RATE: 1000 / 60,
    USER_EXISTS: 'usersExists',
    INVALID_NICKNAME: 'invalidNickname',
    SET_PLAYER_NAME: 'setPlayerName',
    CONNECT: 'connection',
    DISCONNECT: 'disconnect'
})