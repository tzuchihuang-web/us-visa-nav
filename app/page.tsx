"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Your U.S. Visa Journey Starts Here
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Navigate through U.S. visa options, track your application progress, and achieve your American dream with confidence.
            </p>
            <p className="text-lg text-gray-500">Welcome back! Ready to get started?</p>
          </div>
        </section>

        {/* Main CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1: Explore Visas */}
            <Link href="/explore">
              <Card className="h-full p-8 cursor-pointer hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Explore Visas
                </h2>
                <p className="text-gray-600 mb-6">
                  Discover different visa options available to you. Compare requirements, timelines, and success rates.
                </p>
                <Button className="w-full">
                  Start Exploring
                </Button>
              </Card>
            </Link>

            {/* Card 2: Track Application */}
            <Link href="/tracker">
              <Card className="h-full p-8 cursor-pointer hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">📊</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Track Application
                </h2>
                <p className="text-gray-600 mb-6">
                  Monitor your visa application progress, manage documents, and stay on top of your timeline.
                </p>
                <Button className="w-full">
                  View Progress
                </Button>
              </Card>
            </Link>

            {/* Card 3: Profile */}
            <Link href="/profile">
              <Card className="h-full p-8 cursor-pointer hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">👤</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  My Profile
                </h2>
                <p className="text-gray-600 mb-6">
                  Manage your account, view your preferences, and personalize your visa journey.
                </p>
                <Button className="w-full">
                  Go to Profile
                </Button>
              </Card>
            </Link>
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-blue-900 text-white py-16 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Simplifying Your Visa Process</h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              We help you understand visa options, track applications, and reduce stress around the U.S. visa process. 
              Let's make your journey smooth and stress-free.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
