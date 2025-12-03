import { SkillTree } from "@/components/SkillTree";
import { VisaMap } from "@/components/VisaMap";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      <main className="flex h-screen bg-white overflow-hidden">
        {/* Left Sidebar: Skill Tree */}
        <SkillTree />

        {/* Right Main Area: Abstract Visa Map */}
        <VisaMap />
      </main>
    </ProtectedRoute>
  );
}
