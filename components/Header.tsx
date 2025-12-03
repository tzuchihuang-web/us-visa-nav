"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🦅</span>
            <span className="font-bold text-lg text-gray-900">US Visa Navigator</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex gap-8 items-center">
            <Link href="/explore" className="text-gray-700 hover:text-gray-900 font-medium">
              Explore Visas
            </Link>
            <Link href="/tracker" className="text-gray-700 hover:text-gray-900 font-medium">
              Track Application
            </Link>
            <Link href="/profile" className="text-gray-700 hover:text-gray-900 font-medium">
              Profile
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex gap-4">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button size="sm">
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
