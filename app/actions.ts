"use server";

import { db } from "@/lib/db";
import { user, userProgress, section, chapter, lesson } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { unstable_cache, revalidateTag } from "next/cache";

const getCachedUserStats = (userId: string) => unstable_cache(async () => {
  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, userId),
  });

  const progress = await db.query.userProgress.findMany({
    where: eq(userProgress.userId, userId),
  });

  const completedLessons = progress.filter(p => p.completed).map(p => p.lessonId);

  return {
    xp: currentUser?.xp || 0,
    streak: currentUser?.streak || 0,
    role: currentUser?.role || 'user',
    completedLessons,
  };
}, [`user-stats-${userId}`], { revalidate: 3600, tags: [`user-stats-${userId}`] })();

const getCachedCourseContent = unstable_cache(async (lang: string) => {
  const sections = await db.query.section.findMany({
    where: eq(section.language, lang),
    orderBy: (sections, { asc }) => [asc(sections.order)],
    with: {
      chapters: {
        orderBy: (chapters, { asc }) => [asc(chapters.order)],
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.order)],
          }
        }
      }
    }
  });
  return sections;
}, ['course-content'], { revalidate: 3600, tags: ['course-content'] });

const getCachedAllCourseContent = unstable_cache(async () => {
  const sections = await db.query.section.findMany({
    orderBy: (sections, { asc }) => [asc(sections.order)],
    with: {
      chapters: {
        orderBy: (chapters, { asc }) => [asc(chapters.order)],
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.order)],
          }
        }
      }
    }
  });
  return sections;
}, ['all-course-content'], { revalidate: 3600, tags: ['course-content'] });

export const getAllCourseContentAction = async () => {
  return getCachedAllCourseContent();
};

export const getCourseContentAction = async (language: string = 'python') => {
  return getCachedCourseContent(language);
};

export async function completeLessonAction(lessonId: string, xpToAdd: number) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Check if already completed
  const existingProgress = await db.query.userProgress.findFirst({
    where: (up, { eq, and }) => and(eq(up.userId, userId), eq(up.lessonId, lessonId)),
  });

  if (!existingProgress || !existingProgress.completed) {
    // Mark as completed
    if (existingProgress) {
      await db.update(userProgress).set({
        completed: true,
        completedAt: new Date(),
      }).where(eq(userProgress.id, existingProgress.id));
    } else {
      await db.insert(userProgress).values({
        id: crypto.randomUUID(),
        userId,
        lessonId,
        completed: true,
        completedAt: new Date(),
      });
    }

    // Update user XP and streak
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (currentUser) {
      await db.update(user).set({
        xp: currentUser.xp + xpToAdd,
        streak: currentUser.streak + 1, // Simple streak increment for now
      }).where(eq(user.id, userId));
    }
    
    revalidateTag(`user-stats-${userId}`);
  }

  return { success: true };
}

export async function getUserStatsAction() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return { xp: 0, streak: 0, role: 'user', completedLessons: [] };
  }

  return getCachedUserStats(session.user.id);
}

export async function getUsersAction() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (currentUser?.role !== 'admin') {
    throw new Error("Unauthorized");
  }

  const users = await db.query.user.findMany({
    orderBy: (users, { desc }) => [desc(users.xp)],
  });

  return users;
}

export async function makeMeAdminAction() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await db.update(user).set({ role: 'admin' }).where(eq(user.id, session.user.id));
  return { success: true };
}

export async function createSectionAction(data: { title: string; language?: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  
  const currentUser = await db.query.user.findFirst({ where: eq(user.id, session.user.id) });
  if (currentUser?.role !== 'admin') throw new Error("Unauthorized");

  const existingSections = await db.query.section.findMany({
    where: eq(section.language, data.language || 'python'),
  });
  const maxOrder = existingSections.reduce((max, s) => Math.max(max, s.order), -1);

  const newSection = await db.insert(section).values({
    id: crypto.randomUUID(),
    title: data.title,
    language: data.language || 'python',
    order: maxOrder + 1,
  }).returning();

  revalidateTag('course-content');
  return newSection[0];
}

export async function createChapterAction(data: { title: string; sectionId: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  
  const currentUser = await db.query.user.findFirst({ where: eq(user.id, session.user.id) });
  if (currentUser?.role !== 'admin') throw new Error("Unauthorized");

  const existingChapters = await db.query.chapter.findMany({
    where: eq(chapter.sectionId, data.sectionId),
  });
  const maxOrder = existingChapters.reduce((max, c) => Math.max(max, c.order), -1);

  const newChapter = await db.insert(chapter).values({
    id: crypto.randomUUID(),
    title: data.title,
    sectionId: data.sectionId,
    order: maxOrder + 1,
  }).returning();

  revalidateTag('course-content');
  return newChapter[0];
}

export async function importNestedCourseAction(data: any) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  
  const currentUser = await db.query.user.findFirst({ where: eq(user.id, session.user.id) });
  if (currentUser?.role !== 'admin') throw new Error("Unauthorized");

  const language = data.language || 'python';
  const sections = data.sections || [];

  for (const s of sections) {
    const newSection = await db.insert(section).values({
      id: crypto.randomUUID(),
      title: s.title,
      language: language,
    }).returning();
    const sectionId = newSection[0].id;

    for (const c of s.chapters || []) {
      const newChapter = await db.insert(chapter).values({
        id: crypto.randomUUID(),
        title: c.title,
        sectionId: sectionId,
      }).returning();
      const chapterId = newChapter[0].id;

      for (const l of c.lessons || []) {
        await db.insert(lesson).values({
          id: crypto.randomUUID(),
          title: l.title,
          description: l.description || '',
          content: l.content || '',
          challenge: l.challenge || '',
          hint: l.hint || '',
          initialCode: l.initialCode || '',
          expectedOutput: l.expectedOutput || '',
          type: l.type || 'beginner',
          chapterId: chapterId,
        });
      }
    }
  }

  revalidateTag('course-content');
  return { success: true };
}

export async function createLessonAction(data: { 
  title: string; 
  description: string; 
  content: string;
  challenge: string;
  hint?: string;
  initialCode: string;
  expectedOutput: string;
  type: string;
  chapterId: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
  
  const currentUser = await db.query.user.findFirst({ where: eq(user.id, session.user.id) });
  if (currentUser?.role !== 'admin') throw new Error("Unauthorized");

  const existingLessons = await db.query.lesson.findMany({
    where: eq(lesson.chapterId, data.chapterId),
  });
  const maxOrder = existingLessons.reduce((max, l) => Math.max(max, l.order), -1);

  const newLesson = await db.insert(lesson).values({
    id: crypto.randomUUID(),
    title: data.title,
    description: data.description,
    content: data.content,
    challenge: data.challenge,
    hint: data.hint,
    initialCode: data.initialCode,
    expectedOutput: data.expectedOutput,
    type: data.type,
    chapterId: data.chapterId,
    order: maxOrder + 1,
  }).returning();

  revalidateTag('course-content');
  return newLesson[0];
}
