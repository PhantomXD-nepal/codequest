import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	role: text("role").default("user").notNull(),
	xp: integer("xp").default(0).notNull(),
	streak: integer("streak").default(0).notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});

export const userProgress = pgTable("user_progress", {
	id: text("id").primaryKey(),
	userId: text("userId").notNull().references(() => user.id),
	lessonId: text("lessonId").notNull(),
	completed: boolean("completed").default(false),
	completedAt: timestamp("completed_at"),
});

export const section = pgTable("section", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	language: text("language").notNull().default("python"),
	order: integer("order").notNull().default(0),
});

export const chapter = pgTable("chapter", {
	id: text("id").primaryKey(),
	sectionId: text("section_id").notNull().references(() => section.id),
	title: text("title").notNull(),
	order: integer("order").notNull().default(0),
});

export const lesson = pgTable("lesson", {
	id: text("id").primaryKey(),
	chapterId: text("chapter_id").notNull().references(() => chapter.id),
	title: text("title").notNull(),
	description: text("description").notNull(),
	content: text("content").notNull(),
	challenge: text("challenge").notNull(),
	hint: text("hint"),
	initialCode: text("initial_code").notNull(),
	expectedOutput: text("expected_output").notNull(),
	type: text("type").notNull(),
	order: integer("order").notNull().default(0),
});
