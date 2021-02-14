const { CommandoClient } = require("discord.js-commando");
const Audit = require("../types/audit/audit");
const MergeAudit = require("../types/audit/mergeaudit");
const SplitAudit = require("../types/audit/splitaudit");
const Logger = require("../util/logger");

class AuditManager {
	/**
	 *
	 * @param {CommandoClient} client
	 */
	constructor(client) {
		this.client = client;
		this.logger = new Logger(`AuditManager`);
		this.audits = [];
		this.ready = new Promise((resolve, reject) => {
			client.databaseManager.getAllAudits()
				.then(audits => {
					this.audits = audits;
					this.logger.log(`Ready; fetched ${this.audits.length} audits`);
					resolve();
				})
				.catch(err => {
					this.logger.error(`FATAL: AuditManager failed to load`);
					reject(err);
					throw new Error(`AuditManager failed to load!`);
				});
		});
	}

	/**
	 *
	 * @param {Audit} audit
	 */
	async newAudit(audit) {
		if (audit instanceof Audit == false) throw new Error(`The audit is not an Audit!`);
		let json;
		if (audit instanceof MergeAudit) {
			const newaudit = JSON.parse(JSON.stringify(audit));
			delete newaudit.data.to;
			delete newaudit.data.from;
			newaudit.data.to = audit.data.to.id;
			newaudit.data.from = [];
			audit.data.from.forEach(ch => newaudit.data.from.push(ch.id));
			json = JSON.stringify(newaudit.data);
		}
		else if (audit instanceof SplitAudit) {
			const newaudit = JSON.parse(JSON.stringify(audit));
			delete newaudit.data.to;
			delete newaudit.data.from;
			newaudit.data.from = audit.data.from.id;
			newaudit.data.to = [];
			audit.data.to.forEach(ch => newaudit.data.to.push(ch.id));
			json = JSON.stringify(newaudit.data);
		}
		else {
			json = JSON.stringify(audit.data);
		}
		const initiator = audit.initiator;
		const action = audit.action;
		try {
			const id = await this.client.databaseManager.insertAudit(action, initiator, json, audit.timestamp);
			audit.id = id;
			this.audits.push(audit);
			return audit;
		}
		catch (e) {
			this.logger.error(e);
		}
	}
}

module.exports = AuditManager;