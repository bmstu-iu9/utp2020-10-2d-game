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
            players[key].projectiles.forEach((projectile) => {
                let ppx = projectile.x,
                    ppy = projectile.y,
                    img;
                projectile.type === Constants.COUGH_TYPE ?
                    img = this.imgs['Virus.png'] : img = this.imgs['Bullet.png'];
                context.drawImage(img, ppx, ppy, projectile.w, projectile.h);
            })
        }
    }

    drawPlayers(newO, context, players) {
        context.font = Constants.NICKNAME_FONT;
        context.fillStyle = Constants.NICKNAME_COLOR;
        for (let key in players) {
            let player = players[key],
                w = player.w,
                h = player.h,
                text = context.measureText(players[key].name);
            context.save();
            context.translate(newO.x + player.x, newO.y + player.y);
            if (text.width < Constants.PLAYER_WIDTH) {
                context.fillText(player.name, -1 * w / 2 + (90 - text.width) / 2, -1 * h / 2 - 25, 90);
            } else {
                context.fillText(player.name, -1 * w / 2, -1 * h / 2 - 25, 90);
            }
            context.fillStyle = Constants.HP_COLOR;
            context.fillRect(-w / 2, -h / 2 - 15, 90 * player.health, 8);
            context.fillStyle = Constants.HP_ABSENT_COLOR;
            context.fillRect(-w / 2 + 90 * player.health, -h / 2 - 15, 90 * (1 - player.health), 8);
            context.fillStyle = Constants.HP_BAR_FRAME_COLOR;
            context.strokeRect(-w / 2, -h / 2 - 15, 90, 8);
            let img;
            player.role === Constants.HUMAN_TYPE ? img = this.imgs['Human.png'] : img = this.imgs['Zombie.png'];
            context.rotate(player.angleOfRotation);
            context.drawImage(img, -w / 2, -h / 2, w, h);
            context.rotate(-player.angleOfRotation);
            context.restore();
        }
    }

    drawPills(context, pills) {
        pills.forEach((pill) => {
            context.drawImage(this.imgs['Medicine.png'], pill.x, pill.y,
                Constants.PILL_WIDTH, Constants.PILL_HEIGHT);
        })
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
        for (let x = 0; x < Constants.WORLD_WIDTH; x += Constants.FIELD_PIECE_WIDTH)
            for (let y = 0; y < Constants.WORLD_HEIGHT; y += Constants.FIELD_PIECE_HEIGHT)
                context.drawImage(this.imgs['Field.jpg'], x, y,
                    Constants.FIELD_PIECE_WIDTH, Constants.FIELD_PIECE_HEIGHT);
    }
}

module.exports = Render;