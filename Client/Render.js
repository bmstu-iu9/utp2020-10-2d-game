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
                context.beginPath();
                let ppx = players[key].projectiles[i].x,
                    ppy = players[key].projectiles[i].y;
                if (players[key].projectiles[i].type === 'cough') {
                    context.drawImage(this.imgs['Virus.png'], ppx, ppy,
                        Constants.COUGH_WIDTH, Constants.COUGH_HEIGHT);
                    context.fillStyle = "#dd00d9";
                    context.fill();
                    context.closePath();
                } else {
                    context.drawImage(this.imgs['Bullet.png'], ppx, ppy,
                        Constants.BULLET_WIDTH, Constants.BULLET_HEIGHT);
                    context.fillStyle = "#dd00d9";
                    context.fill();
                    context.closePath();
                }
            }
        }
    }

    drawPlayers(context, players) {
        context.font = "12px Arial";
        context.fillStyle = "#0095DD";
        let dy = 15;
        for (let key in players) {
            let x = players[key].x,
                y = players[key].y + 12,
                text = context.measureText(players[key].name);
            if (text.width < 90) {
                context.fillText(players[key].name, x + (90 - text.width) / 2, y, 90);
            } else {
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
                context.drawImage(this.imgs['Human.svg'], x, y,
                    Constants.PLAYER_WIDTH, Constants.PLAYER_HEIGHT);
            } else {
                context.drawImage(this.imgs['Zombie.svg'], x, y,
                    Constants.PLAYER_WIDTH, Constants.PLAYER_HEIGHT);
            }
            y -= 2 * dy;
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
            context.fillStyle = 'rgb(46, 139, 87, 0.25)';
            context.fill();
        }
    }
}

module.exports = Render;