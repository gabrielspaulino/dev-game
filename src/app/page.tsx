import { HomeContent } from "@/components/game/HomeContent";
import { getTrackStats } from "@/app/actions/questions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const trackStats = await getTrackStats();
  return <HomeContent trackStats={trackStats} />;
}
