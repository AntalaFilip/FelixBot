/**
 * Shuffles an array using the Fisher-Yates Shuffle.
 * Taken from {@link https://stackoverflow.com/a/2450976 stackoverflow}
 * @param {Array} array
 * @returns
 */
function shuffle(array) {
	let currentIndex = array.length,
		randomIndex;

	// While there remain elements to shuffle...
	while (currentIndex !== 0) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}

module.exports = shuffle;