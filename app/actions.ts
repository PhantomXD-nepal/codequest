"use server";

import { db } from "@/lib/db";
import { user, userProgress, section, chapter, lesson, achievement, userAchievement, language, course } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { pythonCourse } from "@/lib/lessons";
import { SUPPORTED_LANGUAGES, LANGUAGES } from "@/lib/constants";
import fs from "fs";
import path from "path";

import { unstable_cache, revalidateTag } from "next/cache";

async function getRequiredSession() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session;
}

async function getRequiredAdminSession() {
  const session = await getRequiredSession();
  
  const currentUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (currentUser?.role !== 'admin') {
    throw new Error("Unauthorized: Admin role required");
  }

  return session;
}

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
    hasCompletedOnboarding: currentUser?.hasCompletedOnboarding || false,
    hasCompletedTour: currentUser?.hasCompletedTour || false,
    completedLessons,
  };
}, [`user-stats-${userId}`], { revalidate: 3600, tags: [`user-stats-${userId}`] })();

const getCachedCourseContent = (langName: string) => unstable_cache(async () => {
  const lang = await db.query.language.findFirst({
    where: eq(language.name, langName),
  });

  if (!lang) return [];

  const sections = await db.query.section.findMany({
    where: eq(section.languageId, lang.id),
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
}, [`course-content-${langName}`], { revalidate: 3600, tags: [`course-content-${langName}`, 'course-content'] })();

const getCachedAllCourseContent = unstable_cache(async () => {
  const langs = await db.query.language.findMany({
    orderBy: (langs, { asc }) => [asc(langs.order)],
    with: {
      sections: {
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
      }
    }
  });
  return langs;
}, ['all-course-content'], { revalidate: 3600, tags: ['course-content', 'all-course-content'] });

export const getLanguagesAction = async () => {
  const langs = await db.query.language.findMany({
    orderBy: (langs, { asc }) => [asc(langs.order)],
    with: {
      sections: {
        with: {
          chapters: true
        }
      }
    }
  });

  return langs.map(l => {
    let chapterCount = 0;
    l.sections?.forEach(s => {
      chapterCount += s.chapters?.length || 0;
    });
    return {
      id: l.id,
      name: l.name,
      title: l.title,
      description: l.description,
      chapterCount
    };
  });
};

export const getAllCourseContentAction = async () => {
  return getCachedAllCourseContent();
};

export async function seedAllCoursesAction() {
  await getRequiredAdminSession();
  // Clear existing course data to ensure a clean slate
  // We delete in reverse order of dependencies
  await db.delete(userProgress);
  await db.delete(lesson);
  await db.delete(chapter);
  await db.delete(section);
  await db.delete(course);

  for (let langIdx = 0; langIdx < LANGUAGES.length; langIdx++) {
    const lang = LANGUAGES[langIdx];
    
    await db.insert(language).values({
      id: lang.id,
      name: lang.name,
      title: lang.name,
      description: `Learn ${lang.name}`,
      order: langIdx + 1
    }).onConflictDoUpdate({
      target: language.id,
      set: {
        name: lang.name,
        title: lang.name,
        description: `Learn ${lang.name}`,
        order: langIdx + 1
      }
    });
  }

  for (let langIdx = 0; langIdx < SUPPORTED_LANGUAGES.length; langIdx++) {
    const lang = SUPPORTED_LANGUAGES[langIdx];

    const newCourse = await db.insert(course).values({
      id: `course-${lang.name.toLowerCase().replace(/\s+/g, '-')}`,
      title: lang.title,
      description: lang.description,
      languageId: lang.languageId,
      order: langIdx + 1
    }).returning();

    const newSection = await db.insert(section).values({
      id: `section-${lang.name.toLowerCase().replace(/\s+/g, '-')}`,
      title: lang.title,
      languageId: lang.languageId,
      courseId: newCourse[0].id,
      order: 1
    }).returning();

    if (lang.name === 'python') {
      // Use the rich content from pythonCourse
      for (let sIdx = 0; sIdx < pythonCourse.length; sIdx++) {
        const s = pythonCourse[sIdx];
        for (let cIdx = 0; cIdx < s.chapters.length; cIdx++) {
          const chap = s.chapters[cIdx];
          const newChapter = await db.insert(chapter).values({
            id: `chapter-python-${sIdx}-${cIdx}`,
            title: chap.title,
            sectionId: newSection[0].id,
            order: (sIdx * 10) + cIdx + 1
          }).returning();

          for (let lIdx = 0; lIdx < chap.lessons.length; lIdx++) {
            const les = chap.lessons[lIdx];
            await db.insert(lesson).values({
              id: les.id,
              title: les.title,
              description: les.description,
              content: les.content,
              challenge: les.challenge,
              hint: les.hint || '',
              initialCode: les.initialCode,
              expectedOutput: les.expectedOutput,
              type: les.type,
              chapterId: newChapter[0].id,
              order: lIdx + 1
            });
          }
        }
      }
    } else {
      // Default chapters for other languages if needed, or just leave it for manual import
      const defaultChapters = ['Introduction', 'Fundamentals', 'Advanced Concepts'];
      for (let i = 0; i < defaultChapters.length; i++) {
        const chapterName = defaultChapters[i];
        const newChapter = await db.insert(chapter).values({
          id: `chapter-${lang.name.toLowerCase().replace(/\s+/g, '-')}-${i}`,
          title: chapterName,
          sectionId: newSection[0].id,
          order: i + 1
        }).returning();

        await db.insert(lesson).values({
          id: `lesson-${lang.name.toLowerCase().replace(/\s+/g, '-')}-${i}-1`,
          title: `Introduction to ${chapterName}`,
          description: `Master the fundamentals of ${chapterName} in ${lang.name}.`,
          content: `# ${chapterName}\nWelcome to the ${chapterName} module of ${lang.name}.`,
          challenge: 'Print "Hello Quest"',
          hint: 'Use the standard print or output function for this language.',
          initialCode: lang.name.toLowerCase().includes('html') ? '<!-- Start coding here -->' : '// Start coding here',
          expectedOutput: 'Hello Quest',
          type: 'beginner',
          chapterId: newChapter[0].id,
          order: 1
        });
      }
    }
  }

  try {
    revalidateTag('course-content');
    revalidateTag('all-course-content');
  } catch (e) {
    console.log('Skipping revalidateTag in non-Next.js context');
  }
  return { success: true, message: 'All courses seeded successfully' };
}

export async function getCoursesByLanguageAction(languageId: string) {
  const courses = await db.query.course.findMany({
    where: eq(course.languageId, languageId),
    orderBy: (courses, { asc }) => [asc(courses.order)],
    with: {
      sections: {
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
      }
    }
  });

  return courses;
}

export async function getCourseContentByLanguageAction(languageName: string) {
  const lang = await db.query.language.findFirst({
    where: eq(language.name, languageName),
  });

  if (!lang) return [];

  const sections = await db.query.section.findMany({
    where: eq(section.languageId, lang.id),
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
}

export async function getLessonDetailsAction(lessonId: string) {
  const currentLesson = await db.query.lesson.findFirst({
    where: eq(lesson.id, lessonId),
    with: {
      chapter: {
        with: {
          section: {
            with: {
              language: true
            }
          }
        }
      }
    }
  });

  if (!currentLesson || !currentLesson.chapter || !currentLesson.chapter.section || !currentLesson.chapter.section.language) return null;

  const lessonLanguage = currentLesson.chapter.section.language.name;
  const lessonLanguageId = currentLesson.chapter.section.languageId || '';

  // Fetch all lessons for this language to find the next one
  const languageSections = await db.query.section.findMany({
    where: eq(section.languageId, lessonLanguageId),
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

  let allLessons: any[] = [];
  for (const s of languageSections) {
    for (const c of s.chapters) {
      allLessons = [...allLessons, ...c.lessons];
    }
  }

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  let nextLessonId = null;
  if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
    nextLessonId = allLessons[currentIndex + 1].id;
  }

  return {
    lesson: currentLesson,
    language: lessonLanguage,
    nextLessonId
  };
}

export const getCourseContentAction = async (language: string = 'python') => {
  return getCachedCourseContent(language);
};

export async function completeLessonAction(lessonId: string, xpToAdd: number) {
  const session = await getRequiredSession();
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
    
    // Check for new achievements
    const newAchievements = await checkAndUnlockAchievementsAction();
    return { success: true, newAchievements };
  }

  return { success: true, newAchievements: [] };
}

export async function revertLessonProgressAction(lessonId: string) {
  const session = await getRequiredSession();
  const userId = session.user.id;

  const existingProgress = await db.query.userProgress.findFirst({
    where: (up, { eq, and }) => and(eq(up.userId, userId), eq(up.lessonId, lessonId)),
  });

  if (existingProgress && existingProgress.completed) {
    await db.update(userProgress).set({
      completed: false,
      completedAt: null,
    }).where(eq(userProgress.id, existingProgress.id));

    // Deduct standard XP (10)
    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
    });

    if (currentUser) {
      await db.update(user).set({
        xp: Math.max(0, currentUser.xp - 10),
      }).where(eq(user.id, userId));
    }

    revalidateTag(`user-stats-${userId}`);
    return { success: true };
  }
  return { success: false };
}

export async function completeOnboardingAction(data: { avatar: string, path: string }) {
  const session = await getRequiredSession();
  await db.update(user).set({ 
    hasCompletedOnboarding: true,
    image: data.avatar 
  }).where(eq(user.id, session.user.id));
  return { success: true };
}

export async function completeTourAction() {
  const session = await getRequiredSession();
  await db.update(user).set({ 
    hasCompletedTour: true 
  }).where(eq(user.id, session.user.id));
  return { success: true };
}

export async function getUserStatsAction() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return { xp: 0, streak: 0, role: 'user', completedLessons: [], hasCompletedOnboarding: false, hasCompletedTour: false };
  }

  return getCachedUserStats(session.user.id);
}

export async function getUserRankAction() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return null;
  }

  const users = await db.query.user.findMany({
    orderBy: (users, { desc }) => [desc(users.xp)],
    columns: {
      id: true,
    }
  });

  const rank = users.findIndex(u => u.id === session.user.id) + 1;
  return rank;
}

export async function getLeaderboardAction() {
  const users = await db.query.user.findMany({
    orderBy: (users, { desc }) => [desc(users.xp)],
    limit: 10,
    columns: {
      id: true,
      name: true,
      xp: true,
      image: true,
    }
  });

  return users.map((u, index) => ({
    id: u.id,
    name: u.name,
    xp: u.xp,
    level: Math.floor(Math.sqrt(u.xp / 100)) + 1,
    rank: index + 1,
    avatar: u.image || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.name}`
  }));
}

export async function getUsersAction() {
  await getRequiredAdminSession();

  const users = await db.query.user.findMany({
    orderBy: (users, { desc }) => [desc(users.xp)],
  });

  return users;
}

export async function makeMeAdminAction() {
  const session = await getRequiredSession();

  if (session.user.email !== 'phantomarcanexd@gmail.com') {
    throw new Error("Unauthorized: Only the site owner can use this action");
  }

  await db.update(user).set({ role: 'admin' }).where(eq(user.id, session.user.id));
  return { success: true };
}

export async function createSectionAction(data: { 
  title: string; 
  language?: string;
  courseId?: string;
  languageId?: string;
}) {
  await getRequiredAdminSession();
  
  let langId = data.languageId;
  
  if (!langId) {
    const lang = await db.query.language.findFirst({
      where: eq(language.name, data.language || 'python'),
    });
    if (!lang) throw new Error("Language not found");
    langId = lang.id;
  }

  const existingSections = await db.query.section.findMany({
    where: eq(section.languageId, langId),
  });
  const maxOrder = existingSections.reduce((max, s) => Math.max(max, s.order), -1);

  const newSection = await db.insert(section).values({
    id: crypto.randomUUID(),
    title: data.title,
    courseId: data.courseId,
    languageId: langId,
    order: maxOrder + 1,
  }).returning();

  revalidateTag('course-content');
  return newSection[0];
}

export async function createLanguageAction(data: {
  name: string;
  title: string;
  description?: string;
}) {
  await getRequiredAdminSession();

  const existingLangs = await db.query.language.findMany();
  const maxOrder = existingLangs.reduce((max, l) => Math.max(max, l.order), -1);

  const newLang = await db.insert(language).values({
    id: crypto.randomUUID(),
    name: data.name.toLowerCase(),
    title: data.title,
    description: data.description,
    order: maxOrder + 1,
  }).returning();

  revalidateTag('course-content');
  return newLang[0];
}

export async function createCourseAction(data: {
  title: string;
  description: string;
  languageId: string;
  videoUrl?: string;
  language?: string;
}) {
  await getRequiredAdminSession();

  const existingCourses = await db.query.course.findMany({
    where: eq(course.languageId, data.languageId),
  });
  const maxOrder = existingCourses.reduce((max, c) => Math.max(max, c.order), -1);

  const newCourse = await db.insert(course).values({
    id: crypto.randomUUID(),
    title: data.title,
    description: data.description,
    languageId: data.languageId,
    videoUrl: data.videoUrl,
    language: data.language,
    order: maxOrder + 1,
  }).returning();

  revalidateTag('course-content');
  return newCourse[0];
}

export async function createChapterAction(data: { title: string; sectionId: string }) {
  await getRequiredAdminSession();

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
  await getRequiredAdminSession();

  const langName = data.language || 'python';
  const isSupported = SUPPORTED_LANGUAGES.some(l => l.name === langName);
  if (!isSupported) throw new Error(`Language "${langName}" is not supported. Supported languages: ${SUPPORTED_LANGUAGES.map(l => l.name).join(', ')}`);

  const lang = await db.query.language.findFirst({
    where: eq(language.name, langName),
  });

  if (!lang) throw new Error("Language not found");

  const sections = data.sections || [];

  for (const s of sections) {
    const newSection = await db.insert(section).values({
      id: crypto.randomUUID(),
      title: s.title,
      languageId: lang.id,
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
  await getRequiredAdminSession();

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

export async function updateSectionAction(id: string, data: { title: string; language?: string }) {
  await getRequiredAdminSession();

  const updateData: any = { title: data.title };
  if (data.language) {
    const lang = await db.query.language.findFirst({
      where: eq(language.name, data.language),
    });
    if (lang) {
      updateData.languageId = lang.id;
    }
  }

  const updatedSection = await db.update(section)
    .set(updateData)
    .where(eq(section.id, id))
    .returning();

  revalidateTag('course-content');
  return updatedSection[0];
}

export async function updateChapterAction(id: string, data: { title: string }) {
  await getRequiredAdminSession();

  const updatedChapter = await db.update(chapter)
    .set({
      title: data.title,
    })
    .where(eq(chapter.id, id))
    .returning();

  revalidateTag('course-content');
  return updatedChapter[0];
}

export async function updateLessonAction(id: string, data: { 
  title: string; 
  description: string; 
  content: string;
  challenge: string;
  hint?: string;
  initialCode: string;
  expectedOutput: string;
  type: string;
}) {
  await getRequiredAdminSession();

  const updatedLesson = await db.update(lesson)
    .set({
      title: data.title,
      description: data.description,
      content: data.content,
      challenge: data.challenge,
      hint: data.hint,
      initialCode: data.initialCode,
      expectedOutput: data.expectedOutput,
      type: data.type,
    })
    .where(eq(lesson.id, id))
    .returning();

  revalidateTag('course-content');
  return updatedLesson[0];
}

export async function updateCourseAction(id: string, data: {
  title: string;
  description: string;
  languageId: string;
  videoUrl?: string;
  language?: string;
}) {
  await getRequiredAdminSession();

  const updatedCourse = await db.update(course)
    .set({
      title: data.title,
      description: data.description,
      languageId: data.languageId,
      videoUrl: data.videoUrl,
      language: data.language,
    })
    .where(eq(course.id, id))
    .returning();

  revalidateTag('course-content');
  return updatedCourse[0];
}

export async function generateLessonWithAIAction(topic: string, language: string) {
  await getRequiredAdminSession();

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const prompt = `Generate a coding lesson for the topic "${topic}" in the language "${language}".
  The response must be a JSON object with the following fields:
  - title: A catchy title for the lesson
  - description: A brief summary of what the user will learn
  - content: Detailed markdown content for the lesson
  - challenge: A specific coding task for the user to complete
  - hint: A helpful hint for the challenge
  - initialCode: Starting code for the user
  - expectedOutput: The exact string output expected from the code
  - type: One of "beginner", "intermediate", "advanced"

  Make the content engaging and educational.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://codequest.app",
        "X-Title": "CodeQuest"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo", // Or any other model
        messages: [
          { role: "system", content: "You are an expert coding tutor. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("AI Generation failed:", error);
    throw new Error("Failed to generate lesson with AI");
  }
}

export async function deleteSectionAction(id: string) {
  await getRequiredAdminSession();

  // Delete all lessons in all chapters of this section
  const chapters = await db.query.chapter.findMany({
    where: eq(chapter.sectionId, id),
  });
  
  for (const c of chapters) {
    await db.delete(lesson).where(eq(lesson.chapterId, c.id));
  }
  
  // Delete all chapters
  await db.delete(chapter).where(eq(chapter.sectionId, id));
  
  // Delete section
  await db.delete(section).where(eq(section.id, id));

  revalidateTag('course-content');
  return { success: true };
}

export async function getCourseByIdAction(id: string) {
  await getRequiredSession();

  const foundCourse = await db.query.course.findFirst({
    where: eq(course.id, id),
    with: {
      sections: {
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
      }
    }
  });

  return foundCourse;
}

export async function getAllCoursesAction() {
  await getRequiredAdminSession();
  
  const courses = await db.query.course.findMany({
    with: {
      sections: {
        with: {
          chapters: {
            with: {
              lessons: true
            }
          }
        }
      }
    },
    orderBy: (courses, { asc }) => [asc(courses.order)],
  });

  return courses;
}

export async function deleteCourseAction(id: string) {
  await getRequiredAdminSession();

  // Delete all lessons, chapters, sections in this course
  const sections = await db.query.section.findMany({ where: eq(section.courseId, id) });
  for (const s of sections) {
    const chapters = await db.query.chapter.findMany({ where: eq(chapter.sectionId, s.id) });
    for (const c of chapters) {
      await db.delete(lesson).where(eq(lesson.chapterId, c.id));
      await db.delete(chapter).where(eq(chapter.id, c.id));
    }
    await db.delete(section).where(eq(section.id, s.id));
  }
  
  await db.delete(course).where(eq(course.id, id));

  revalidateTag('course-content');
  return { success: true };
}

export async function deleteChapterAction(id: string) {
  await getRequiredAdminSession();

  // Delete all lessons in this chapter
  await db.delete(lesson).where(eq(lesson.chapterId, id));
  
  // Delete chapter
  await db.delete(chapter).where(eq(chapter.id, id));

  revalidateTag('course-content');
  return { success: true };
}

export async function deleteLessonAction(id: string) {
  await getRequiredAdminSession();

  await db.delete(lesson).where(eq(lesson.id, id));

  revalidateTag('course-content');
  return { success: true };
}

// --- Achievement Actions ---

export async function getAchievementsAction() {
  await getRequiredSession();
  
  const achievements = await db.query.achievement.findMany();
  return achievements;
}

export async function createAchievementAction(data: {
  title: string;
  description: string;
  icon: string;
  conditionType: string;
  conditionValue: number;
}) {
  await getRequiredAdminSession();

  const newAchievement = await db.insert(achievement).values({
    id: crypto.randomUUID(),
    title: data.title,
    description: data.description,
    icon: data.icon,
    conditionType: data.conditionType,
    conditionValue: data.conditionValue,
  }).returning();

  return newAchievement[0];
}

export async function updateAchievementAction(id: string, data: {
  title: string;
  description: string;
  icon: string;
  conditionType: string;
  conditionValue: number;
}) {
  await getRequiredAdminSession();

  const updatedAchievement = await db.update(achievement).set({
    title: data.title,
    description: data.description,
    icon: data.icon,
    conditionType: data.conditionType,
    conditionValue: data.conditionValue,
  }).where(eq(achievement.id, id)).returning();

  return updatedAchievement[0];
}

export async function deleteAchievementAction(id: string) {
  await getRequiredAdminSession();

  await db.delete(userAchievement).where(eq(userAchievement.achievementId, id));
  await db.delete(achievement).where(eq(achievement.id, id));

  return { success: true };
}

export async function getUserAchievementsAction() {
  const session = await getRequiredSession();

  const userAchievements = await db.query.userAchievement.findMany({
    where: eq(userAchievement.userId, session.user.id),
    with: {
      achievement: true
    }
  });

  return userAchievements;
}

export async function checkAndUnlockAchievementsAction() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return;

  const userId = session.user.id;
  
  const currentUser = await db.query.user.findFirst({ where: eq(user.id, userId) });
  if (!currentUser) return;

  const progress = await db.query.userProgress.findMany({
    where: eq(userProgress.userId, userId),
  });
  const completedLessonsCount = progress.filter(p => p.completed).length;

  const allAchievements = await db.query.achievement.findMany();
  const userUnlocked = await db.query.userAchievement.findMany({
    where: eq(userAchievement.userId, userId),
  });
  const unlockedIds = new Set(userUnlocked.map(ua => ua.achievementId));

  const newUnlocks = [];

  for (const ach of allAchievements) {
    if (unlockedIds.has(ach.id)) continue;

    let unlocked = false;
    if (ach.conditionType === 'xp' && currentUser.xp >= ach.conditionValue) {
      unlocked = true;
    } else if (ach.conditionType === 'lessons' && completedLessonsCount >= ach.conditionValue) {
      unlocked = true;
    } else if (ach.conditionType === 'streak' && currentUser.streak >= ach.conditionValue) {
      unlocked = true;
    }

    if (unlocked) {
      await db.insert(userAchievement).values({
        id: crypto.randomUUID(),
        userId,
        achievementId: ach.id,
      });
      newUnlocks.push(ach);
    }
  }

  return newUnlocks;
}

export async function deleteAllCoursesAction() {
  await getRequiredAdminSession();

  await db.delete(userProgress);
  await db.delete(lesson);
  await db.delete(chapter);
  await db.delete(section);

  revalidateTag('course-content');
  revalidateTag('all-course-content');
  return { success: true };
}

export async function getLlmsTxtAction() {
  await getRequiredAdminSession();

  const filePath = path.join(process.cwd(), "public", "llms.txt");
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, "utf-8");
  }
  return "";
}

export async function updateLlmsTxtAction(content: string) {
  await getRequiredAdminSession();

  const filePath = path.join(process.cwd(), "public", "llms.txt");
  fs.writeFileSync(filePath, content, "utf-8");
  return { success: true };
}

export async function generateLessonAction(prompt: string) {
  await getRequiredAdminSession();
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set. Please add it to your environment variables.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      messages: [
        { 
          role: "system", 
          content: "You are an expert coding tutor for children. Generate a fun, engaging lesson in JSON format. The JSON must have: title, description, content (markdown), challenge (short task), hint, initialCode, and expectedOutput. Keep it simple and magical." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  try {
    return JSON.parse(content);
  } catch (e) {
    // Fallback if the model doesn't return perfect JSON despite the format request
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse AI response as JSON");
  }
}
