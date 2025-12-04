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
    <header className="glass-panel sticky top-0 z-50 mx-4 mt-4">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-black text-2xl text-black tracking-tight">US VISA NAVIGATOR</span>
          </Link>

          {/* Navigation Links - Only show if authenticated */}
          {isAuthenticated && (
            <nav className="hidden md:flex gap-6 items-center">
              <Link 
                href="/explore" 
                className={`font-bold text-sm transition-colors ${
                  pathname?.includes("/explore") 
                    ? "text-black underline underline-offset-4" 
                    : "text-gray-600 hover:text-black"
                }`}
              >
                EXPLORE VISAS
              </Link>
              <Link 
                href="/tracker" 
                className={`font-bold text-sm transition-colors ${
                  pathname?.includes("/tracker") 
                    ? "text-black underline underline-offset-4" 
                    : "text-gray-600 hover:text-black"
                }`}
              >
                TRACK APPLICATION
              </Link>
              <Link 
                href="/profile" 
                className={`font-bold text-sm transition-colors ${
                  pathname?.includes("/profile") 
                    ? "text-black underline underline-offset-4" 
                    : "text-gray-600 hover:text-black"
                }`}
              >
                PROFILE
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
                <button
                  className="glass-button px-4 py-2 text-sm"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  {loading ? "Signing out..." : "SIGN OUT"}
                </button>
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
