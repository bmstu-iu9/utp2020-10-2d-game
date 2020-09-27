module.exports = Object.freeze({
    WORLD_MIN: 0,
    WORLD_WIDTH: 3000,
    WORLD_HEIGHT: 3000,

    ZOMBIE_MAX_HEALTH: 1.00,
    ZOMBIE_SPEED: 5,
    ZOMBIE_TYPE: 'Zombie',
    ZOMBIE_TIME_BETWEEN_SHOOTS: 200,

    HUMAN_MAX_HEALTH: 1.00,
    HUMAN_SPEED: 5,
    HUMAN_TIME_BETWEEN_SHOOTS: 50,
    HUMAN_TYPE: 'Human',

    COUGH_SPEED: 5, //скорость полёта кашля
    COUGH_WIDTH: 10, //длина снаряда кашя
    COUGH_HEIGHT: 10, //ширина снаряда кашля
    COUGH_DAMAGE: 0.05, //урон от кашля
    COUGH_TYPE: 'Cough',
    COUGH_FLIGHT_DISTANCE: 200, //дальность кашля

    BULLET_SPEED: 10, //скорость полёта пули
    BULLET_WIDTH: 10, //длина модельки пули
    BULLET_HEIGHT: 10, //ширина модельки пули
    BULLET_FLIGHT_DISTANCE: 400, //дальность кашля
    BULLET_TYPE: 'Bullet',
    BULLET_DAMAGE: 0.10, //урон от пули

    PROJECTILE_WIDTH: 10,
    PROJECTILE_HEIGHT: 10,

    PLAYER_WIDTH: 90, //длина прямоугольника модельки человека
    PLAYER_HEIGHT: 90, //ширина прямоугольника модельки человека
    PLAYER_DEFAULT_MULTIPLIER: 1.00,
    PLAYER_QUANTITY_TO_START: 5,

    POWERUP_WIDTH: 50,
    POWERUP_HEIGHT: 50,
    POWERUP_APPEARANCE_PERIOD: 10000,
    POWERUP_PILL_TYPE: 'Pill',
    POWERUP_PILL_HEALTH: 0.10,
    POWERUP_MASK_TYPE: 'Mask',
    POWERUP_MASK_MULTIPLIER: 0.25,
    POWERUP_MASK_DURATION: 5000,

    IMG_NAMES: [
        'Zombie.png', //Zombie
        'Human.png', //Human
        'Cough.png', //моделька снарядов - кашля
        'Mask.png',
        'Pill.png', //лекарство
        'Bullet.png', //пуля
        'Field.jpg',
        'Stone.jpg',
        'back.jpg' //картинка для фона
    ],
    POWERUP_TYPES: [
        'Mask',
        'Pill'
    ],
    STONE_TYPE: 'Stone',
    STONE_SIZE: 75,


    STATE_UPDATE: 'update',
    PLAYER_ACTION: 'playerAction',
    PLAY: 'playTheGame',
    USER_EXISTS: 'usersExists',
    INVALID_NICKNAME: 'invalidNickname',
    SET_PLAYER_NAME: 'setPlayerName',
    CONNECT: 'connection',
    DISCONNECT: 'disconnect',
    GAME_OVER: 'gameOver',
    NEW_MSG: 'newMessage',
    USER_TYPING: 'someoneIsTyping',
    STOP_TYPING: 'stopTyping',
    NEW_NOTE: 'newNotification',
    LDB_UPDATE: 'leaderboardUpdate',
    TO_LOBBY: 'toLobby',
    ADD_TO_LOBBY: 'addToLobby',
    LDB_UPDATE: 'leaderboardUpdate',


    CHAT_WIDTH_PERCENT: 0.20, //проуент экрана, занимаемого чатом

    NICKNAME_FONT: "15px Arial", //шрифт для имен над игроками
    NICKNAME_COLOR: "#000000", //цвет для имен над игроками
    HP_BAR_FRAME_COLOR: "#000000", //цвет контура шкалы здоровья
    HP_COLOR: "#32CD32", //цвет оставшегося здоровья
    HP_MASK_COLOR: "#66cdaa",
    HP_ABSENT_COLOR: "#B22222", //цвет отнятого здоровья

    EPIDEMIC_AREA_COLOR: 'rgb(46, 139, 87, 0.25)',
    EPIDEMIC_AREA_TIME_OF_FIRST_EPIDEMIC: 10000,

    FIELD_PIECE_WIDTH: 150,
    FIELD_PIECE_HEIGHT: 150,
    FIELD_TYPE: 'Field',


    RELOAD_PISTOL: 5000, //длительность перезарядки пистолета
    MAX_RADIUS_OF_EPIDEMIC_AREA: 100,
    FRAME_RATE: 1000 / 60
})