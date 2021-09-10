const EduBase = require("./edubase");

class EduPeriod extends EduBase {
	constructor({ id, name, short, period, starttime, endtime }, mgr) {
		super({ id }, mgr);
		/** @type {string} */
		this.name = name;
		/** @type {string} */
		this.short = short;
		/** @type {number} */
		this.period = Number(period);
		/** @type {string} */
		this.starttime = starttime;
		/** @type {string} */
		this.endtime = endtime;
	}

	get times() {
		const [shr, smin] = this.starttime.split(':').map(t => Number(t));
		const [ehr, emin] = this.endtime.split(':').map(t => Number(t));
		const sInSec = ((shr * 60) + smin) * 60;
		const eInSec = ((ehr * 60) + emin) * 60;
		const duration = eInSec - sInSec;

		return {
			start: {
				hr: shr,
				min: smin,
				inSec: sInSec,
			},
			end: {
				hr: ehr,
				min: emin,
				inSec: eInSec,
			},
			duration,
		};
	}
}

module.exports = EduPeriod;