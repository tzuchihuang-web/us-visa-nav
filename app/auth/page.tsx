/**
 * Authentication Page - Combined Sign Up / Sign In
 * 
 * Features:
 * - Toggle between signup and signin modes
 * - Email and password inputs
 * - Form validation
 * - Error messages
 * - Loading states
 * - Redirect to home on success
 * - Responsive design with Shadcn/ui
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/useAuth";

export default function AuthPage() {
  const { signUp, signIn, loading, error } = useAuth();

  // Form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState("");

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Validation
    if (!email) {
      setLocalError("Email is required");
      return;
    }
    if (!password) {
      setLocalError("Password is required");
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setLocalError("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        setLocalError("Password must be at least 6 characters");
        return;
      }
      const result = await signUp(email, password, name);
      if (result && !result.success) {
        setLocalError(result.error || "Sign up failed");
      }
    } else {
      const result = await signIn(email, password);
      if (result && !result.success) {
        setLocalError(result.error || "Sign in failed");
      }
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <Card className="w-full max-w-md glass-panel border-2">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-black mb-2">
              US VISA NAVIGATOR
            </h1>
            <p className="text-gray-700 font-semibold">
              {isSignUp ? "Create your account" : "Welcome back"}
            </p>
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="mb-6 p-4 glass-panel border-red-200 rounded-xl">
              <p className="text-sm text-red-700 font-semibold">{displayError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field (sign up only) */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-black text-black mb-2 uppercase tracking-wide">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full font-semibold"
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-xs font-black text-black mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full font-semibold"
              />
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-black text-black mb-2 uppercase tracking-wide">
                Password
              </label>
              <Input
                type="password"
                placeholder={isSignUp ? "At least 6 characters" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full font-semibold"
              />
            </div>

            {/* Confirm Password field (sign up only) */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-black text-black mb-2 uppercase tracking-wide">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full font-semibold"
                />
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 text-white font-black py-3 rounded-xl mt-6"
            >
              {loading
                ? "LOADING..."
                : isSignUp
                  ? "SIGN UP"
                  : "SIGN IN"}
            </Button>
          </form>

          {/* Toggle between sign up and sign in */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700 font-semibold">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setLocalError("");
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                  setName("");
                }}
                className="ml-2 text-black hover:text-gray-700 font-black underline"
              >
                {isSignUp ? "SIGN IN" : "SIGN UP"}
              </button>
            </p>
          </div>

          {/* Demo info */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-black text-center mb-3 font-black uppercase tracking-wide">
              Demo Credentials
            </p>
            <div className="glass-panel p-4 rounded-xl space-y-1 text-xs text-gray-700 font-semibold">
              <p>
                <span className="font-black">Email:</span> demo@example.com
              </p>
              <p>
                <span className="font-black">Password:</span> demo123456
              </p>
              <p className="text-gray-600 mt-2">
                (Create your own account or use demo credentials)
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
