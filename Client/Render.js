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
                    ppy = players[key].projectiles[i].y,
                    projectile = players[key].projectiles[i],
                    img;
                projectile.type === Constants.COUGH_TYPE ?
                    img = this.imgs['Virus.png'] : img = this.imgs['Bullet.png'];
                context.drawImage(img, ppx, ppy, projectile.w, projectile.h);
                context.fillStyle = "#dd00d9";
                context.fill();
            }
        }
    }

    drawPlayers(context, players) {
        // context.save(); //заносит в стек текущее положение экрана
        context.font = "12px Arial";
        context.fillStyle = "#0095DD";
        // context.translate(players[socket.id].screenWidth/2 - players[socket.id].x/2,players[socket.id].screenHeight/2-players[socket.id].y/2);
        // console.log(players[socket.id]);
        let dy = 15;
        for (let key in players) {
            console.log(players[key])
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
            let img;
            players[key].role === Constants.HUMAN_TYPE ? img = this.imgs['Human.svg'] : img = this.imgs['Zombie.svg'];
            context.drawImage(img, x, y, players[key].w, players[key].h);
            y -= 2 * dy;
        }
        // context.restore(); //достаёт из стека последнее состояние
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
    drawFrame(context) {
        context.strokeRect(0, 0, Constants.WORLD_WIDTH, Constants.WORLD_HEIGHT);
    }
}

module.exports = Render;