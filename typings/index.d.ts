import { GuildMember } from "discord.js";
import LessonManager from "../managers/lessonmanager";

declare class Lesson {
	public constructor(client: CommandoClient, id?: number, manager: LessonManager, teacher: GuildMember, lessonid: string, classid: string, group: string, period: number, students: GuildMember[], startedAt: Date, endedAt: Date, nocache: boolean);
	readonly id: number;
	
}