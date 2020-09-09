const Rect = require('./Rect.js');
const Constants = require('../Constants.js');
const Wall = require('../Wall.js');
//класс лекарства
class Powerup extends Rect {
    constructor(x, y, w, h, type, data,duration) {
        super(x, y, w, h);
        this.type = type;
        this.data = data;
        this.exist = true;
        this.expirationTime = 0;
        this.duration = duration;
    }

    static create() {
		let x_mb, y_mb;
		while (true) {
			x_mb = Math.random() * Constants.WORLD_WIDTH;
			y_mb = Math.random() * Constants.WORLD_HEIGHT;
			let flag = true;
			for (let arr of Wall) {
				if (x_mb + Constants.POWERUP_WIDTH > arr[0] && x_mb < arr[1] && y_mb + Constants.POWERUP_WIDTH > arr[2] && y_mb < arr[3]) {
					flag = false;
					break;
				}
    		}
			if (flag) {
				break;
			}
		}
		const x = x_mb;
		const y = y_mb;
        const w = Constants.POWERUP_WIDTH;
        const h = Constants.POWERUP_WIDTH;
        const type = Constants.POWERUP_TYPES[Math.floor(Math.random() * Constants.POWERUP_TYPES.length)];
        let data = null;
        let duration = null;
        switch (type) {
            case Constants.POWERUP_PILL_TYPE:
                data = Constants.POWERUP_PILL_HEALTH;
                duration = 0;
                break;
            case Constants.POWERUP_MASK_TYPE:
                data = Constants.POWERUP_MASK_MULTIPLIER;
                duration = Constants.POWERUP_MASK_DURATION;
                break;
        }
        return new Powerup(x, y, w, h, type, data, duration);
    }

    isExist() {
        return this.exist;
    }

    pickUp(currentTime) {
        this.exist = false;
        this.expirationTime = currentTime + this.duration;
    }
}
module.exports = Powerup;
