"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, signOut, loading } = useAuth();
  
  // Don't show header on auth page
  if (pathname === "/auth") {
    return null;
  }

  const handleLogout = async () => {
    await signOut();
    router.push("/auth");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🦅</span>
            <span className="font-bold text-lg text-gray-900">US Visa Navigator</span>
          </Link>

          {/* Navigation Links - Only show if authenticated */}
          {isAuthenticated && (
            <nav className="hidden md:flex gap-8 items-center">
              <Link 
                href="/explore" 
                className={`font-medium transition-colors ${
                  pathname?.includes("/explore") 
                    ? "text-blue-600" 
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Explore Visas
              </Link>
              <Link 
                href="/tracker" 
                className={`font-medium transition-colors ${
                  pathname?.includes("/tracker") 
                    ? "text-blue-600" 
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Track Application
              </Link>
              <Link 
                href="/profile" 
                className={`font-medium transition-colors ${
                  pathname?.includes("/profile") 
                    ? "text-blue-600" 
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Profile
              </Link>
            </nav>
          )}

          {/* User Menu */}
          <div className="flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                {/* User info */}
                <div className="hidden md:block text-sm">
                  <p className="text-gray-700 font-medium">
                    {user?.name || user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-gray-500 text-xs">{user?.email}</p>
                </div>

                {/* Logout button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  {loading ? "Signing out..." : "Sign Out"}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push("/auth")}
                >
                  Sign In
                </Button>
                <Button 
                  size="sm"
                  onClick={() => router.push("/auth")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
