import { getCourseContentAction, getUserStatsAction, checkAndUnlockAchievementsAction, getUserRankAction, getLanguagesAction } from "@/app/actions";
import DashboardClientPage from "./client-page";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/signin");
  }

  // Fetch initial data on the server
  const [initialCourseData, initialStats, initialRank, initialLanguages] = await Promise.all([
    getCourseContentAction('python'),
    getUserStatsAction(),
    getUserRankAction(),
    getLanguagesAction(),
    checkAndUnlockAchievementsAction()
  ]);

  return (
    <DashboardClientPage 
      initialCourseData={initialCourseData} 
      initialStats={initialStats} 
      initialRank={initialRank}
      initialLanguages={initialLanguages}
    />
  );
}
