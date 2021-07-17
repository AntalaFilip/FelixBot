const ButtonStyle = {
	Primary: 1,
	Secondary: 2,
	Success: 3,
	Destructive: 4,
	Link: 5,
};

const CallbackType = {
	PONG: 1,
	CHANNEL_MESSAGE: 4,
	CHANNEL_MESSAGE_DEFER: 5,
	UPDATE_MESSAGE: 7,
	UPDATE_MESSAGE_DEFER: 6,
};

const InteractionType = {
	PING: 1,
	COMMAND: 2,
	COMPONENT: 3,
};

/**
 *
 * @param {string} message
 * @param {boolean} ephemeral
 * @returns
 */
const CmdMessageResponse = (message, ephemeral) => {
	return {
		"type": CallbackType.CHANNEL_MESSAGE,
		"data": {
			"content": message,
			"flags": ephemeral ? 64 : null,
		},
	};
};

const ComMessageResponse = (message, ephemeral) => {
	return {
		"type": CallbackType.UPDATE_MESSAGE,
		"data": {
			"content": message,
			"flags": ephemeral ? 64 : null,
		},
	};
};

const MessageComponent = {
	actionRow: (...children) => ({
		"type": 1,
		"components": children,
	}),
	/**
	 *
	 * @param {number} style
	 * @param {{label: string?, emoji: *}} text
	 * @param {string} id Custom ID
	 * @param {string?} url URL
	 * @param {boolean} disabled
	 * @returns
	 */
	button: (style, text, id, url, disabled) => {
		const obj = {
			"type": 2,
			"style": style,
			"label": text.label,
			"emoji": text.emoji,
			"custom_id": id,
			"url": url,
			"disabled": disabled,
		};
		return obj;
	},
	/**
	 *
	 * @param {string} id
	 * @param {string?} placeholder
	 * @param {number?} min
	 * @param {number?} max
	 * @param {*} opts
	 * @returns
	 */
	select: (id, placeholder, min, max, opts) => ({
		"type": 3,
		"custom_id": id,
		"options": opts,
		"placeholder": placeholder,
		"min_values": min,
		"max_values": max,
	}),
	/**
	 *
	 * @param {string} label
	 * @param {string} value
	 * @param {string?} desc
	 * @param {*} emoji
	 * @param {boolean?} def
	 * @returns
	 */
	selectOpt: (label, value, desc, emoji, def) => ({
		"label": label,
		"value": value,
		"description": desc,
		"emoji": emoji,
		"default": def || false,
	}),
};

// module.exports = { ButtonStyle, MessageComponent, CallbackType, InteractionType, CmdMessageResponse, ComMessageResponse };