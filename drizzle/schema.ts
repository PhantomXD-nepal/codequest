import { pgTable, unique, text, boolean, timestamp, integer, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	role: text().default('user').notNull(),
	xp: integer().default(0).notNull(),
	streak: integer().default(0).notNull(),
}, (table) => [
	unique("user_email_key").on(table.email),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_fkey"
		}),
	unique("session_token_key").on(table.token),
]);

export const section = pgTable("section", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	language: text().default('python').notNull(),
	order: integer().default(0).notNull(),
});

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_fkey"
		}),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const chapter = pgTable("chapter", {
	id: text().primaryKey().notNull(),
	sectionId: text("section_id").notNull(),
	title: text().notNull(),
	order: integer().default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.sectionId],
			foreignColumns: [section.id],
			name: "chapter_section_id_fkey"
		}),
]);

export const userProgress = pgTable("user_progress", {
	id: text().primaryKey().notNull(),
	userid: text().notNull(),
	lessonid: text().notNull(),
	completed: boolean().default(false),
	completedAt: timestamp("completed_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userid],
			foreignColumns: [user.id],
			name: "user_progress_userid_fkey"
		}),
]);

export const lesson = pgTable("lesson", {
	id: text().primaryKey().notNull(),
	chapterId: text("chapter_id").notNull(),
	title: text().notNull(),
	description: text().notNull(),
	content: text().notNull(),
	challenge: text().notNull(),
	hint: text(),
	initialCode: text("initial_code").notNull(),
	expectedOutput: text("expected_output").notNull(),
	type: text().notNull(),
	order: integer().default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.chapterId],
			foreignColumns: [chapter.id],
			name: "lesson_chapter_id_fkey"
		}),
]);
