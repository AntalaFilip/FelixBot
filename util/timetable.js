const { Collection } = require("discord.js");
const EduCard = require("../types/edu/educard");

class TimetableUtil {
	/**
	 * @param {EduCard[]} cards
	 * @param {boolean} teacher
	 */
	static cardsToText(cards, teacher) {
		const collection = new Collection(
			cards.map(
				card => {
					const short = card.lesson.subject.role ? `<@&${card.lesson.subject.role.id}>` : card.lesson.subject.short;
					const time = `${card.period.starttime}-${card.period.endtime}`;
					// Map the teachers' names - if they have already identified in Discord, mention them, else use the EduPage short
					const tnames = card.lesson.teachers.map(t => t.member ? `<@${t.member.id}>` : t.short).join(' & ');
					// Map the classes' names - if they have an assigned role mention id, else use the plaintext name
					const cnames = card.lesson.classes.map(c => c.role ? `<@&${c.role.id}>` : c.name).join(' & ');
					// Map the group names
					const garr = card.lesson.groups.map(g => g.name);
					// Check if the group names are unique
					const isGUnique = garr.every((g, i, a) => a.indexOf(g, i + 1) === -1);
					// If they are not unique, remap the group names with class names
					if (!isGUnique) garr.splice(0, garr.length, ...card.lesson.groups.map(g => `${g.name} (${g.class.role ? '<@&' + g.class.role.id + '>' : g.class.name})`));
					// join into a string
					const gnames = garr.join(' & ');
					// create main string
					const str = `${time} > ${short} with ${teacher ? cnames : tnames} group ${gnames}`;
					// return in collection-accepted format
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