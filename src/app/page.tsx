import { HomeContent } from "@/components/game/HomeContent";
import { getTrackStats, type TrackStats } from "@/app/actions/questions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let trackStats: TrackStats[];
  try {
    trackStats = await getTrackStats();
  } catch {
    trackStats = [];
  }
  return <HomeContent trackStats={trackStats} />;
}
