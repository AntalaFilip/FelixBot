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
					// TODO add check if card contains two groups with same name and if so, add classes to clarify them
					// TODO? possibly make it into mentions instead of plains names
					const str = `${card.period.starttime}-${card.period.endtime} > ${card.lesson.subject.name} with ${card.lesson.teachers.map(t => t.member ? removeStartingDot(t.member.displayName) : t.short).join(' & ')} group ${card.lesson.groups.map(g => g.name).join(' & ')}`;
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