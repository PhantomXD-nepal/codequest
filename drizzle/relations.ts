import { relations } from "drizzle-orm/relations";
import { user, session, account, section, chapter, userProgress, lesson } from "./schema";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
	accounts: many(account),
	userProgresses: many(userProgress),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const chapterRelations = relations(chapter, ({one, many}) => ({
	section: one(section, {
		fields: [chapter.sectionId],
		references: [section.id]
	}),
	lessons: many(lesson),
}));

export const sectionRelations = relations(section, ({many}) => ({
	chapters: many(chapter),
}));

export const userProgressRelations = relations(userProgress, ({one}) => ({
	user: one(user, {
		fields: [userProgress.userid],
		references: [user.id]
	}),
}));

export const lessonRelations = relations(lesson, ({one}) => ({
	chapter: one(chapter, {
		fields: [lesson.chapterId],
		references: [chapter.id]
	}),
}));