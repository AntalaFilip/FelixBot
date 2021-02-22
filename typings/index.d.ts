import { GuildMember } from "discord.js";
import LessonManager from "../managers/lessonmanager";

declare class Lesson {
	public constructor(client: CommandoClient, id?: number, manager: LessonManager, teacher: GuildMember, lessonid: string, classid: string, group: string, period: number, students: GuildMember[], startedAt: Date, endedAt: Date, nocache: boolean);
	readonly id: number;
	
}

export class LessonParticipant {
	readonly member: GuildMember;
	readonly created: Date;
	readonly name: string;
	readonly voice: {
		connects: Array<Date>;
		disconnects: Array<Date>;
	}
}