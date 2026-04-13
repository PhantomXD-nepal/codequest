import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	role: text("role").default("student").notNull(),
	xp: integer("xp").default(0).notNull(),
	streak: integer("streak").default(0).notNull(),
	hasCompletedOnboarding: boolean("has_completed_onboarding").default(false).notNull(),
	hasCompletedTour: boolean("has_completed_tour").default(false).notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
	progress: many(userProgress),
	achievements: many(userAchievement),
}));

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
	userId: text("userid").notNull().references(() => user.id),
	lessonId: text("lessonid").notNull(),
	completed: boolean("completed").default(false),
	completedAt: timestamp("completed_at"),
});

export const userProgressRelations = relations(userProgress, ({ one }) => ({
	user: one(user, {
		fields: [userProgress.userId],
		references: [user.id],
	}),
}));

export const language = pgTable("language", {
	id: text("id").primaryKey(),
	name: text("name").notNull().unique(),
	title: text("title").notNull(),
	description: text("description"),
	order: integer("order").notNull().default(0),
});

export const languageRelations = relations(language, ({ many }) => ({
	courses: many(course),
	sections: many(section),
}));

export const course = pgTable("course", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description"),
	languageId: text("language_id").notNull().references(() => language.id),
	order: integer("order").notNull().default(0),
	videoUrl: text("video_url"),
	language: text("language"),
});

export const courseRelations = relations(course, ({ one, many }) => ({
	language: one(language, {
		fields: [course.languageId],
		references: [language.id],
	}),
	sections: many(section),
}));

export const section = pgTable("section", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	courseId: text("course_id").references(() => course.id),
	languageId: text("language_id").references(() => language.id),
	order: integer("order").notNull().default(0),
});

export const sectionRelations = relations(section, ({ one, many }) => ({
	course: one(course, {
		fields: [section.courseId],
		references: [course.id],
	}),
	language: one(language, {
		fields: [section.languageId],
		references: [language.id],
	}),
	chapters: many(chapter),
}));

export const chapter = pgTable("chapter", {
	id: text("id").primaryKey(),
	sectionId: text("section_id").notNull().references(() => section.id),
	title: text("title").notNull(),
	order: integer("order").notNull().default(0),
});

export const chapterRelations = relations(chapter, ({ one, many }) => ({
	section: one(section, {
		fields: [chapter.sectionId],
		references: [section.id],
	}),
	lessons: many(lesson),
}));

export const lesson = pgTable("lesson", {
	id: text("id").primaryKey(),
	chapterId: text("chapter_id").references(() => chapter.id),
	title: text("title").notNull(),
	description: text("description").notNull(),
	content: text("content").notNull(),
	challenge: text("challenge").notNull(),
	hint: text("hint"),
	initialCode: text("initial_code").notNull(),
	expectedOutput: text("expected_output"),
	type: text("type").notNull(),
	order: integer("order").notNull().default(0),
});

export const lessonRelations = relations(lesson, ({ one }) => ({
	chapter: one(chapter, {
		fields: [lesson.chapterId],
		references: [chapter.id],
	}),
}));

export const achievement = pgTable("achievement", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	icon: text("icon").notNull(), // e.g., 'Award', 'Zap', 'Shield'
	conditionType: text("condition_type").notNull(), // e.g., 'xp', 'lessons', 'streak'
	conditionValue: integer("condition_value").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAchievement = pgTable("user_achievement", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id),
	achievementId: text("achievement_id").notNull().references(() => achievement.id),
	unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export const achievementRelations = relations(achievement, ({ many }) => ({
	userAchievements: many(userAchievement),
}));

export const userAchievementRelations = relations(userAchievement, ({ one }) => ({
	user: one(user, {
		fields: [userAchievement.userId],
		references: [user.id],
	}),
	achievement: one(achievement, {
		fields: [userAchievement.achievementId],
		references: [achievement.id],
	}),
}));
