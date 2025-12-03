import { SkillTree } from "@/components/SkillTree";
import { VisaMap } from "@/components/VisaMap";

export default function Home() {
  return (
    <main className="flex h-screen bg-white overflow-hidden">
      {/* Left Sidebar: Skill Tree */}
      <SkillTree />

      {/* Right Main Area: Abstract Visa Map */}
      <VisaMap />
    </main>
  );
}
