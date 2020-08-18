class Input {
    constructor() {
        this.upPressed = false;
        this.downPressed = false;
        this.leftPressed = false;
        this.rightPressed = false;
        this.mousePressed = false;
        this.mouseX = 0;
        this.mouseY = 0;
    }

    static create(document) {
        const input = new Input();
        input.applyEventHandlers(document)
        return input;

    }
    //детектит нажатие клавишы
    keyDownHandler(e) {
        if (e.key === "d" || e.key === "ArrowRight")
            this.rightPressed = true;
        else if (e.key === "a" || e.key === "ArrowLeft")
            this.leftPressed = true;
        else if (e.key === "w" || e.key === "ArrowUp")
            this.upPressed = true;
        else if (e.key === "s" || e.key === "ArrowDown")
            this.downPressed = true;

    }
    //детектит отпускание клавиши
    keyUpHandler(e) {
        if (e.key === "d" || e.key === "ArrowRight")
            this.rightPressed = false;
        else if (e.key === "a" || e.key === "ArrowLeft")
            this.leftPressed = false;
        else if (e.key === "w" || e.key === "ArrowUp")
            this.upPressed = false;
        else if (e.key === "s" || e.key === "ArrowDown")
            this.downPressed = false;
    }

    //детектит нажатие кнопки мыши
    mouseDownHandler() {
        this.mousePressed = true;
    }
    //детектит отпускание кнопки мыши
    mouseUpHandler() {
        this.mousePressed = false;
    }
    mouseMoveHandler(event) {
        this.mouseMove = true;
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    }


    applyEventHandlers(document) {
        document.addEventListener('keydown', this.keyDownHandler.bind(this));
        document.addEventListener('keyup', this.keyUpHandler.bind(this));
        document.addEventListener('mousemove', this.mouseMoveHandler.bind(this))
        document.addEventListener('mousedown', this.mouseDownHandler.bind(this))
        document.addEventListener('mouseup', this.mouseUpHandler.bind(this))
    }
}

module.exports = Input;