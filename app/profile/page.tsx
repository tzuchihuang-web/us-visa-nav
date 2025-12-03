"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  getUserProfile,
  updateUserProfile,
  UserProfile,
} from "@/lib/supabase/client";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    const userProfile = await getUserProfile(user.id);
    setProfile(userProfile);
    setFormData({ name: userProfile?.name || "" });
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    const updated = await updateUserProfile(user.id, {
      name: formData.name || undefined,
    });
    if (updated) {
      setProfile(updated);
      setEditing(false);
    }
    setLoading(false);
  };

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
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Profile Information
                </h2>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                  </div>
                ) : editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter your name"
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProfile}
                        className="flex-1"
                        disabled={loading}
                      >
                        {loading ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        onClick={() => setEditing(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Name
                      </label>
                      <p className="text-gray-900">
                        {profile?.name || user?.email?.split("@")[0] || "User"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Email
                      </label>
                      <p className="text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700">
                        Member Since
                      </label>
                      <p className="text-gray-900">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "Just now"}
                      </p>
                    </div>
                    <Button
                      onClick={() => setEditing(true)}
                      className="w-full mt-4"
                    >
                      Edit Profile
                    </Button>
                  </div>
                )}
              </Card>

              {/* Visa Preferences */}
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Visa Interests
                </h2>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile?.visa_interests && profile.visa_interests.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.visa_interests.map((visa) => (
                          <span
                            key={visa}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {visa}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm">
                        No visa interests selected yet. Explore visa options to add them!
                      </p>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Skill Levels */}
            {profile && !editing && (
              <Card className="mt-6 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Skill Levels
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      key: "education_level",
                      label: "Education",
                      value: profile.education_level || 0,
                    },
                    {
                      key: "work_experience",
                      label: "Work Experience",
                      value: profile.work_experience || 0,
                    },
                    {
                      key: "field_of_work",
                      label: "Field of Work",
                      value: profile.field_of_work || 0,
                    },
                    {
                      key: "citizenship_level",
                      label: "Citizenship Status",
                      value: profile.citizenship_level || 0,
                    },
                    {
                      key: "investment_level",
                      label: "Investment Capacity",
                      value: profile.investment_level || 0,
                    },
                    {
                      key: "language_level",
                      label: "Language Proficiency",
                      value: profile.language_level || 0,
                    },
                  ].map((skill) => (
                    <div key={skill.key}>
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        {skill.label}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${(skill.value / 5) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-600 w-6">
                          {skill.value}/5
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              <Button
                onClick={handleLogout}
                variant="destructive"
              >
                Sign Out
              </Button>
            </div>
          </section>
        </main>
      </>
    </ProtectedRoute>
  );
}
