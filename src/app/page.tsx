import { HomeContent } from "@/components/game/HomeContent";
import { getSkillStats, type SkillStats } from "@/app/actions/questions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let skillStats: SkillStats[];
  try {
    skillStats = await getSkillStats();
  } catch {
    skillStats = [];
  }
  return <HomeContent skillStats={skillStats} />;
}
