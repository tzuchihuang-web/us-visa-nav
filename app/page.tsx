import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { VisaCard } from "@/components/VisaCard";

export default function Home() {
  const visas = [
    {
      id: "f1",
      name: "F-1 Student",
      emoji: "🎓",
      path: "/explore#f1",
      color: "from-blue-400 to-blue-600",
      description: "University Path - Pursue your academic dreams",
      timeline: "4-6 weeks",
      successRate: 92,
      delay: 0,
    },
    {
      id: "h1b",
      name: "H-1B Work",
      emoji: "💼",
      path: "/explore#h1b",
      color: "from-purple-400 to-purple-600",
      description: "Career Path - Advance your professional goals",
      timeline: "2-3 months",
      successRate: 85,
      delay: 0.2,
    },
    {
      id: "o1",
      name: "O-1 Talent",
      emoji: "⭐",
      path: "/explore#o1",
      color: "from-yellow-400 to-orange-500",
      description: "Achievement Path - For extraordinary talent",
      timeline: "2-4 months",
      successRate: 78,
      delay: 0.4,
    },
    {
      id: "l1",
      name: "L-1 Transfer",
      emoji: "🚀",
      path: "/explore#l1",
      color: "from-green-400 to-green-600",
      description: "Advancement Path - Transfer within your company",
      timeline: "2-3 months",
      successRate: 88,
      delay: 0.1,
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="mb-4 text-6xl animate-bounce">🦅</div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Your Visa Journey Awaits
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-4 max-w-2xl mx-auto">
            Explore your options, discover opportunities, and unlock your path to success
          </p>
          <p className="text-lg text-slate-400">
            ✨ Click on any visa path to explore and unlock opportunities
          </p>
        </section>

        {/* Interactive Visa Map */}
        <section className="relative py-20 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Floating Islands Grid with Hexagonal arrangement */}
            <div className="flex flex-wrap justify-center items-start gap-12 md:gap-16 lg:gap-20">
              {/* Top row - F-1 and H-1B */}
              <div className="flex justify-center w-full md:w-auto md:translate-x-0 lg:translate-x-12">
                <VisaCard {...visas[0]} />
              </div>
              <div className="flex justify-center w-full md:w-auto">
                <VisaCard {...visas[1]} />
              </div>

              {/* Bottom row - O-1 and L-1 (offset for hexagonal effect) */}
              <div className="flex justify-center w-full md:w-auto md:translate-x-12 lg:translate-x-24">
                <VisaCard {...visas[2]} />
              </div>
              <div className="flex justify-center w-full md:w-auto md:translate-x-0 lg:translate-x-12">
                <VisaCard {...visas[3]} />
              </div>
            </div>

            {/* Connecting lines (optional - subtle grid effect) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-10"
              style={{ mixBlendMode: "screen" }}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              {/* Hexagonal grid lines */}
              <line x1="20%" y1="30%" x2="80%" y2="30%" stroke="url(#lineGradient)" strokeWidth="2" />
              <line x1="20%" y1="70%" x2="80%" y2="70%" stroke="url(#lineGradient)" strokeWidth="2" />
            </svg>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-400/30 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Already tracking an application?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tracker">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  📊 View My Progress
                </Button>
              </Link>
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="border-blue-400 text-blue-300 hover:bg-blue-600/20 px-8 py-3 text-lg"
                >
                  👤 My Profile
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer tagline */}
        <section className="relative text-center py-12">
          <p className="text-slate-400 text-lg">
            🌟 Making visa navigation fun, not stressful
          </p>
        </section>

        <style>{`
          @keyframes blob {
            0%,
            100% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }

          .animate-blob {
            animation: blob 7s infinite;
          }

          .animation-delay-2000 {
            animation-delay: 2s;
          }

          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </main>
    </>
  );
}
