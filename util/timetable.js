const { Collection } = require("discord.js");
const FelixBotClient = require("../client");
const EduCard = require("../types/edu/educard");
const { removeStartingDot } = require("./stringutils");

class TimetableUtil {
	/**
	 * @param {EduCard[]} cards
	 */
	static cardsToText(cards) {
		const collection = new Collection(
			cards.map(
				card => {
					// TODO? possibly make it into mentions instead of plains names
					const short = card.lesson.subject.short;
					const time = `${card.period.starttime}-${card.period.endtime}`;
					// Map the teachers' names - if they have already identified in Discord, use their Discord member name, else use the EduPage short
					const tnames = card.lesson.teachers.map(t => t.member ? removeStartingDot(t.member.displayName) : t.short).join('&');
					// Map the group names
					const garr = card.lesson.groups.map(g => g.name);
					// Check if the group names are unique
					const isGUnique = garr.every((g, i, a) => a.indexOf(g, i + 1) === -1);
					// If they are not unique, remap the group names with class names
					if (!isGUnique) garr.splice(0, garr.length, ...card.lesson.groups.map(g => `${g.name} (${g.class.name})`));
					const gnames = garr.join(' & ');
					const str = `${time} > ${short} with ${tnames} group ${gnames}`;
					return [
						card.id,
						str,
					];
				},
			),
		);
		return collection;
	}
}

module.exports = TimetableUtil;