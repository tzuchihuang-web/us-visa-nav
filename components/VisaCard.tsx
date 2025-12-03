"use client";

import { useState } from "react";
import Link from "next/link";

interface VisaCardProps {
  id: string;
  name: string;
  emoji: string;
  path: string;
  color: string;
  description: string;
  timeline: string;
  successRate: number;
  delay?: number;
}

export function VisaCard({
  id,
  name,
  emoji,
  path,
  color,
  description,
  timeline,
  successRate,
  delay = 0,
}: VisaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="relative"
      style={{
        animation: `float 3s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <Link href={path}>
        <div
          className={`
            relative w-48 h-48 rounded-3xl cursor-pointer
            transition-all duration-300 ease-out
            hover:scale-110 hover:shadow-2xl
            border-4 border-white
            flex flex-col items-center justify-center
            bg-gradient-to-br
            ${color}
            shadow-lg
            ${isExpanded ? "ring-4 ring-yellow-300" : ""}
          `}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          {/* Unlock sparkle effect */}
          {isExpanded && (
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
              <div className="absolute top-1/4 right-0 w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 text-center px-4">
            {!isExpanded ? (
              <>
                {/* Locked state */}
                <div className="text-5xl mb-3 animate-bounce">{emoji}</div>
                <h3 className="text-lg font-bold text-white">{name}</h3>
                <p className="text-sm text-white/80 mt-2">Click to explore</p>
              </>
            ) : (
              <>
                {/* Unlocked state - show details */}
                <div className="text-4xl mb-2">{emoji}</div>
                <h3 className="text-lg font-bold text-white mb-2">{name}</h3>
                <div className="text-xs text-white/90 space-y-1">
                  <p>⏱️ {timeline}</p>
                  <p>📈 {successRate}% success</p>
                </div>
                <p className="text-xs text-white/80 mt-3 line-clamp-2">
                  {description}
                </p>
                <div className="mt-4 text-2xl">✨</div>
              </>
            )}
          </div>

          {/* Hexagon background pattern */}
          <div className="absolute inset-0 opacity-10 rounded-3xl">
            <svg
              className="w-full h-full"
              viewBox="0 0 200 200"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern id={`hex-${id}`} x="0" y="0" width="40" height="40">
                  <polygon
                    points="20,0 40,10 40,30 20,40 0,30 0,10"
                    fill="white"
                    opacity="0.1"
                  />
                </pattern>
              </defs>
              <rect width="200" height="200" fill={`url(#hex-${id})`} />
            </svg>
          </div>
        </div>
      </Link>

      {/* Float animation using CSS-in-JS alternative */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}
