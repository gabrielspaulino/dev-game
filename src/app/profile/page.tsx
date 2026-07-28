import { ProfileContent } from "@/components/game/ProfileContent";
import { getSkillStats, type SkillStats } from "@/app/actions/questions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  let skillStats: SkillStats[];
  try {
    skillStats = await getSkillStats();
  } catch {
    skillStats = [];
  }
  return <ProfileContent skillStats={skillStats} />;
}
