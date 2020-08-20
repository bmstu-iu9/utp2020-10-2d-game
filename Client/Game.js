const Constants = require('../Constants.js');
const Render = require('./Render.js');
const Input = require('./Input.js');
const Point = require('../Server/Point.js')

class Game {
    constructor(render, input, socket) {
        this.imgs = {};
        this.render = render;
        this.input = input;
        this.socket = socket;

        this.me = null;
        this.players = {};
        this.pills = {};
        this.area = null;
        this.newO = new Point(0,0);
        this.animationFrameId = null;
        this.lastUpdateTime = 0;
        this.dt = 0;
    }

    static create(document, socket) {
        const game = new Game(Render.create(),
            Input.create(document),
            socket);
        game.init();
        return game;
    }

    downloadImages() {
        let downloadImage = (imageName) => {
            return new Promise(resolve => {
                const img = new Image();
                img.src = `/css/${imageName}`;
                img.onload = () => {
                    console.log(`Downloaded ${imageName}`);
                    this.imgs[imageName] = img;
                    resolve();
                };
            });
        }
        Promise.all(Constants.IMG_NAMES.map(downloadImage)).then(() => console.log('All images downloaded'));
        this.render.loadImgs(this.imgs);
    }

    start(canvas, context) {
        this.dt = Date.now() - this.lastUpdateTime;
        this.lastUpdateTime = Date.now();

        this.update();
        this.socket.on(Constants.STATE_UPDATE, this.getState.bind(this));
        this.renderGame(canvas, context);

        //this.animationFrameId =  window.requestAnimationFrame(this.start(canvas,context).bind(this));
    }

    stop() {
        window.cancelAnimationFrame(this.animationFrameId);
    }

    init() {
        this.lastUpdateTime = Date.now();
        this.socket.on(Constants.STATE_UPDATE, this.getState.bind(this));
    }

    getState(state) {
        this.me = state.me;
        this.players = state.players;
        this.pills = state.pills;
        this.area = state.area;
        this.newO = new Point(this.me.screenWidth / 2 - this.me.x - this.me.w / 2,
            this.me.screenHeight / 2 - this.me.y - this.me.h / 2);
    }

    update() {
        if (this.me) {
            this.socket.emit(Constants.PLAYER_ACTION, {
                up: this.input.upPressed,
                down: this.input.downPressed,
                left: this.input.leftPressed,
                right: this.input.rightPressed,
                mouse: this.input.mousePressed,
                mouseX: this.input.mouseX - this.newO.x ,
                mouseY: this.input.mouseY - this.newO.y,
                dt: this.dt
            })
        }
    }

    renderGame(canvas, context) {
        this.render.clear(canvas, context);
        context.save();
        context.translate(this.newO.x,this.newO.y);
        this.render.drawFrame(context);
        this.render.drawProjectiles(context, this.players);
        this.render.drawPlayers(context, this.players);
        this.render.drawPills(context, this.pills);
        this.render.drawEpidemicArea(context, this.area);
        context.restore();
    }
}

module.exports = Game;