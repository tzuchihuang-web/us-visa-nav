"use client";

import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { visaCategories } from "@/lib/mockData";

export default function ExplorePage() {
  return (
    <ProtectedRoute>
      <>
        <Header />
        <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Visa Options</h1>
            <p className="text-lg text-gray-600 mb-12">
              Discover different U.S. visa categories and find the best path for your goals.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {visaCategories.map((visa) => (
                <Card key={visa.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{visa.name}</h2>
                    <p className="text-gray-600">{visa.description}</p>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Requirements:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                        {visa.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Timeline</p>
                        <p className="text-gray-600">{visa.timeline}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Success Rate</p>
                        <p className="text-green-600 font-bold">{visa.successRate}%</p>
                      </div>
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Learn More
                  </button>
                </Card>
              ))}
            </div>
          </section>
        </main>
      </>
    </ProtectedRoute>
  );
}
