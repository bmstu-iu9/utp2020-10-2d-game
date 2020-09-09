const Constants = require('../Constants.js');
const Wall = require('../Wall.js');

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
        context.drawImage(this.imgs['back'], 0, 0);
    }

    drawProjectiles(context, players) {
        for (let key in players) {
            players[key].projectiles.forEach((projectile) => {
                let ppx = projectile.x,
                    ppy = projectile.y;
                context.drawImage(this.imgs[projectile.type], ppx, ppy, projectile.w, projectile.h);
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
            player.damageMultiplier === Constants.PLAYER_DEFAULT_MULTIPLIER ?
                context.fillStyle = Constants.HP_COLOR :
                context.fillStyle = Constants.HP_MASK_COLOR;
            context.fillRect(-w / 2, -h / 2 - 15, 90 * player.health, 8);
            context.fillStyle = Constants.HP_ABSENT_COLOR;
            context.fillRect(-w / 2 + 90 * player.health, -h / 2 - 15, 90 * (1 - player.health), 8);
            context.fillStyle = Constants.HP_BAR_FRAME_COLOR;
            context.strokeRect(-w / 2, -h / 2 - 15, 90, 8);
            context.rotate(player.angleOfRotation);
            context.drawImage(this.imgs[player.role], -w / 2, -h / 2, w, h);
            context.rotate(-player.angleOfRotation);
            context.restore();
        }
    }

    drawPowerups(context, powerups) {
        powerups.forEach((powerup) => {
            context.drawImage(this.imgs[powerup.type], powerup.x, powerup.y, powerup.w, powerup.h);
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
                context.drawImage(this.imgs[Constants.FIELD_TYPE], x, y,
                    Constants.FIELD_PIECE_WIDTH, Constants.FIELD_PIECE_HEIGHT);
		for (let arr of Wall) {
			for (let i = arr[0]; i < arr[1]; i+= Constants.STONE_SIZE) {
				for (let j = arr[2]; j < arr[3]; j += Constants.STONE_SIZE) {
					context.drawImage(this.imgs[Constants.STONE_TYPE], i, j, Constants.FIELD_PIECE_WIDTH / 2, Constants.FIELD_PIECE_HEIGHT / 2);
				}
			}
		}
	}
}

module.exports = Render;
