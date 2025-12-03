"use client";

import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <ProtectedRoute>
      <>
        <Header />
        <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">My Profile</h1>

            <div className="grid md:grid-cols-2 gap-6">
              {/* User Info */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Name</label>
                    <p className="text-gray-900">{user?.name || user?.email?.split("@")[0] || "User"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Email</label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Member Since</label>
                    <p className="text-gray-900">
                      {user?.created_at 
                        ? new Date(user.created_at).toLocaleDateString() 
                        : "Just now"}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Visa Preferences */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Visa Preferences</h2>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-gray-700">F-1 Student Visa</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-gray-700">H-1B Work Visa</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-gray-700">O-1 Extraordinary Ability</span>
                  </label>
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>
          </section>
        </main>
      </>
    </ProtectedRoute>
  );
}
