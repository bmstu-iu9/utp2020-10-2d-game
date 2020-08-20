const Constants = require('../Constants.js');

class Render {
    constructor() {
        this.imgs = {};
    }

    static create(context) {
        const render = new Render(context);
        return render;
    }

    loadImgs(imgs) {
        this.imgs = imgs;
    }

    clear(canvas, context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    drawProjectiles(context, players) {
        for (let key in players) {
            for (let i = 0; i < players[key].projectiles.length; i++) {
                let ppx = players[key].projectiles[i].x,
                    ppy = players[key].projectiles[i].y,
                    projectile = players[key].projectiles[i],
                    img;
                projectile.type === Constants.COUGH_TYPE ?
                    img = this.imgs['Virus.png'] : img = this.imgs['Bullet.png'];
                context.drawImage(img, ppx, ppy, projectile.w, projectile.h);
            }
        }
    }

    drawPlayers(context, players) {
        context.font = Constants.NICKNAME_FONT;
        context.fillStyle = Constants.NICKNAME_COLOR;
        for (let key in players) {
            let x = players[key].x,
                y = players[key].y + 15,
                text = context.measureText(players[key].name);
            if (text.width < Constants.PLAYER_WIDTH) {
                context.fillText(players[key].name, x + (90 - text.width) / 2, y, 90);
            } else {
                context.fillText(players[key].name, x, y, 90);
            }
            y += 10;
            context.fillStyle = Constants.HP_BAR_FRAME_COLOR;
            context.fillRect(x, y, 90, 8);
            context.fillStyle = Constants.HP_COLOR;
            context.fillRect(x + 1, y + 1, 88 * players[key].health, 6);
            context.fillStyle = Constants.HP_ABSENT_COLOR;
            context.fillRect(x + 1 + 88 * players[key].health, y + 1, 88 * (1 - players[key].health), 6);
            y += 15;
            let img;
            players[key].role === Constants.HUMAN_TYPE ? img = this.imgs['Human.svg'] : img = this.imgs['Zombie.svg'];
            context.drawImage(img, x, y, players[key].w, players[key].h);
        }
    }

    drawPills(context, pills) {
        for (let i in pills) {
            context.drawImage(this.imgs['medicinedrawn.svg'], pills[i].x, pills[i].y,
                Constants.PILL_WIDTH, Constants.PILL_HEIGHT);
        }
    }

    drawEpidemicArea(context, area) {
        if (area.marker) {
            console.log('drawing epidemic area');
            context.beginPath();
            context.arc(area.o.x, area.o.y, area.radius, 0, Math.PI * 2, true);
            context.fillStyle = Constants.EPIDEMIC_AREA_COLOR;
            context.fill();
        }
    }

    drawFrame(context) {
        context.strokeRect(0, 0, Constants.WORLD_WIDTH, Constants.WORLD_HEIGHT);
    }

    drawField(context) {
        for (let x = 0; x < Constants.WORLD_WIDTH;) {
            for (let y = 0; y < Constants.WORLD_HEIGHT;) {
                context.drawImage(this.imgs['Field.jpg'], x, y,
                    Constants.FIELD_PIECE_WIDTH, Constants.FIELD_PIECE_HEIGHT);
                y += 150;
            }
            x += 150;
        }
    }
}

module.exports = Render;