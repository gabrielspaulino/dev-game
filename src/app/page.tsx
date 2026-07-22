import { SkillTree } from "@/components/game/SkillTree";
import { ProgressTopBar } from "@/components/game/ProgressTopBar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <ProgressTopBar />
      <SkillTree />
    </div>
  );
}
