/**
 * VISA MAP COMPONENT - JOURNEY-BASED LAYOUT
 * 
 * Displays visa paths as a journey starting from user's current visa
 * or a "Start" node if no visa.
 * 
 * Layout:
 * - Left to right flow (time progression)
 * - Hierarchical levels: Start -> Entry -> Intermediate -> Advanced
 * - Lines connecting related visa paths
 * - Interactive hover cards
 */

"use client";

import { useState, useMemo } from "react";
import {
  visaPaths,
  userProfile,
  getStartingVisa,
  getEligiblePaths,
  calculateTreePositions,
  getVisaState,
  mapConfig,
} from "@/lib/mapData";

interface VisaNode {
  id: string;
  name: string;
  emoji: string;
  description: string;
  fullDescription: string;
  category: string;
  tier: string;
  requirements: Record<string, any>;
  previousVisas: string[];
  color: string;
  badge: string;
}

interface Position {
  x: number;
  y: number;
}

function AbstractMapBackground() {
  /**
   * Renders the abstract map background with grid lines
   * CUSTOMIZE: Change in mapConfig (lib/mapData.ts)
   */

  const gridLines = [];
  const canvasWidth = 1400;
  const canvasHeight = 800;

  // Generate vertical grid lines
  for (let x = 0; x < canvasWidth; x += mapConfig.gridSpacing) {
    gridLines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1="0"
        x2={x}
        y2={canvasHeight}
        stroke={mapConfig.gridColor}
        strokeWidth="1"
        opacity={mapConfig.gridOpacity}
      />
    );
  }

  // Generate horizontal grid lines
  for (let y = 0; y < canvasHeight; y += mapConfig.gridSpacing) {
    gridLines.push(
      <line
        key={`h-${y}`}
        x1="0"
        y1={y}
        x2={canvasWidth}
        y2={y}
        stroke={mapConfig.gridColor}
        strokeWidth="1"
        opacity={mapConfig.gridOpacity}
      />
    );
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      style={{ backgroundColor: mapConfig.backgroundColor }}
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Grid */}
      {gridLines}

      {/* Decorative left side accent */}
      <circle cx="5%" cy="50%" r="120" fill="url(#gradientLeft)" opacity="0.08" />

      {/* Gradient definitions */}
      <defs>
        <radialGradient id="gradientLeft">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e40af" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function PathLines({
  visasToShow,
  positions,
  hoveredNodeId,
}: {
  visasToShow: VisaNode[];
  positions: Record<string, Position>;
  hoveredNodeId: string | null;
}) {
  /**
   * Draws lines connecting visa paths
   * Lines show the journey flow from previous visas to next visas
   */

  const viewBoxWidth = 1400;
  const viewBoxHeight = 800;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Curved path definitions for smooth connections */}
        <style>{`
          .visa-path-line {
            fill: none;
            stroke: ${mapConfig.pathColor};
            stroke-width: ${mapConfig.pathWidth};
            opacity: ${mapConfig.pathOpacity};
            transition: opacity 300ms ease;
            stroke-dasharray: 5,5;
          }
          
          .visa-path-line.highlighted {
            opacity: ${mapConfig.pathHoverOpacity};
            stroke: #3b82f6;
            stroke-width: 3;
          }
        `}</style>
      </defs>

      {/* Draw connection lines */}
      {visasToShow.map((visa) => {
        if (!visa.previousVisas.length) return null;

        return visa.previousVisas.map((prevVisaId) => {
          const prevVisa = visasToShow.find((v) => v.id === prevVisaId);
          if (!prevVisa || !positions[prevVisaId] || !positions[visa.id]) return null;

          const fromPos = positions[prevVisaId];
          const toPos = positions[visa.id];

          const x1 = (fromPos.x / 100) * viewBoxWidth;
          const y1 = (fromPos.y / 100) * viewBoxHeight;
          const x2 = (toPos.x / 100) * viewBoxWidth;
          const y2 = (toPos.y / 100) * viewBoxHeight;

          const isHighlighted =
            hoveredNodeId === visa.id || hoveredNodeId === prevVisaId;

          // Create curved path (quadratic Bezier)
          const midX = (x1 + x2) / 2;
          const controlX = midX + (x2 - x1) * 0.3;
          const pathData = `M ${x1} ${y1} Q ${controlX} ${(y1 + y2) / 2} ${x2} ${y2}`;

          return (
            <path
              key={`path-${prevVisaId}-${visa.id}`}
              d={pathData}
              className={`visa-path-line ${isHighlighted ? "highlighted" : ""}`}
            />
          );
        });
      })}
    </svg>
  );
}

function VisaNodeElement({
  visa,
  state,
  position,
  isHovered,
  isStarting,
  onHover,
  onHoverEnd,
  onClick,
}: {
  visa: VisaNode;
  state: string;
  position: Position;
  isHovered: boolean;
  isStarting: boolean;
  onHover: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
}) {
  /**
   * Individual visa node on the journey map
   * Starting node is highlighted with larger size and glow
   */

  const isLocked = state === "locked";
  const statusColor =
    mapConfig.statusColors[state as keyof typeof mapConfig.statusColors];

  // Calculate size based on whether it's the starting node
  const nodeSize = isStarting ? 70 : mapConfig.nodeRadius;

  return (
    <div
      className="absolute transition-all duration-300"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isHovered ? 50 : 10,
        cursor: isLocked ? "not-allowed" : "pointer",
      }}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      onClick={onClick}
    >
      {/* Glow effect for starting node */}
      {isStarting && (
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            width: `${nodeSize + 20}px`,
            height: `${nodeSize + 20}px`,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            zIndex: -1,
          }}
        />
      )}

      {/* Main node circle */}
      <div
        className="flex items-center justify-center rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
        style={{
          width: `${nodeSize}px`,
          height: `${nodeSize}px`,
          opacity: isLocked ? mapConfig.nodeLockedOpacity : mapConfig.nodeUnlockedOpacity,
          transform: isHovered ? `scale(${mapConfig.nodeHoverScale})` : "scale(1)",
          backgroundColor: isLocked ? "#f3f4f6" : "#ffffff",
          border: isStarting
            ? "3px solid #3b82f6"
            : isLocked
              ? "2px dashed #d1d5db"
              : "2px solid #e5e7eb",
          boxShadow:
            isStarting && !isLocked
              ? "0 0 20px rgba(59, 130, 246, 0.3)"
              : "none",
        }}
      >
        {/* Emoji */}
        <span
          className="drop-shadow-md"
          style={{
            fontSize: `${nodeSize * 0.5}px`,
          }}
        >
          {visa.emoji}
        </span>
      </div>

      {/* Status badge */}
      <div
        className="absolute -top-2 -right-2 px-2 py-1 text-xs font-semibold rounded-full shadow-sm"
        style={{
          backgroundColor: statusColor.bg,
          color: statusColor.text,
        }}
      >
        {isLocked ? "🔒" : isStarting ? "🌟" : state === "recommended" ? "⭐" : "✓"}
      </div>

      {/* Lock overlay (if locked) */}
      {isLocked && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-full bg-white/30"
          style={{
            width: `${nodeSize}px`,
            height: `${nodeSize}px`,
          }}
        >
          <span className="text-xl">🔒</span>
        </div>
      )}

      {/* Hover tooltip/card - Smart positioning to stay in viewport */}
      {isHovered && (
        <div
          className="absolute w-72 bg-white rounded-xl shadow-2xl p-5 border border-gray-200 z-50"
          style={{
            animation: "slideIn 150ms ease-out",
            // Smart positioning: show to the right, but adjust vertically to stay in viewport
            left: "calc(100% + 20px)",
            top: position.y < 25 ? "0" : position.y > 75 ? "auto" : "50%",
            bottom: position.y > 75 ? "0" : "auto",
            transform: position.y < 25 || position.y > 75 ? "none" : "translateY(-50%)",
            marginTop: position.y < 25 ? "0" : position.y > 75 ? "0" : "0",
            pointerEvents: "auto",
          }}
        >
          {/* Visa name */}
          <h3 className="font-bold text-lg text-gray-900 mb-1">{visa.name}</h3>

          {/* Category and tier badges */}
          <div className="flex gap-2 mb-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${visa.badge}`}>
              {visa.category}
            </span>
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
              {visa.tier}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3">{visa.fullDescription}</p>

          {/* Status indicator */}
          <div className="mb-4 pb-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-700">
              Status:{" "}
              <span style={{ color: statusColor.text }}>
                {state === "locked" ? "🔒 Locked" : state === "recommended" ? "⭐ Recommended" : "✓ Available"}
              </span>
            </p>
          </div>

          {/* Learn more button */}
          <button
            onClick={onClick}
            disabled={isLocked}
            className={`w-full py-2 px-3 rounded-lg font-medium text-sm transition-all ${
              isLocked
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLocked ? "Unlock Skills to Access" : "Explore Path"}
          </button>
        </div>
      )}

      {/* CSS animation */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px) translateY(-50%);
          }
          to {
            opacity: 1;
            transform: translateX(0) translateY(-50%);
          }
        }
      `}</style>
    </div>
  );
}

export function VisaMap({ recommendedVisas = [] }: { recommendedVisas?: string[] }) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // CUSTOMIZE: Determine starting visa and eligible paths
  const startingVisaId = useMemo(() => getStartingVisa(userProfile), []);
  const visasToShow = useMemo(
    () => getEligiblePaths(startingVisaId, userProfile),
    [startingVisaId]
  );

  // Calculate tree positions for all visible visas
  const positions = useMemo(() => calculateTreePositions(visasToShow), [visasToShow]);

  return (
    <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Background grid and decorations */}
      <AbstractMapBackground />

      {/* Path lines connecting visa nodes */}
      <PathLines
        visasToShow={visasToShow}
        positions={positions}
        hoveredNodeId={hoveredNodeId}
      />

      {/* Visa nodes */}
      <div className="relative w-full h-full">
        {visasToShow.map((visa) => {
          const baseState = getVisaState(visa, userProfile.skills);
          // Override state to "recommended" if this visa is in recommendedVisas
          const state = recommendedVisas.includes(visa.id) ? "recommended" : baseState;
          const isStarting = visa.id === startingVisaId;
          const pos = positions[visa.id];

          if (!pos) return null;

          return (
            <VisaNodeElement
              key={visa.id}
              visa={visa}
              state={state}
              position={pos}
              isHovered={hoveredNodeId === visa.id}
              isStarting={isStarting}
              onHover={() => setHoveredNodeId(visa.id)}
              onHoverEnd={() => setHoveredNodeId(null)}
              onClick={() => {
                if (state !== "locked") {
                  console.log(`Exploring visa: ${visa.name}`);
                  // CUSTOMIZE: Add navigation or modal logic here
                }
              }}
            />
          );
        })}
      </div>

      {/* Journey info panel */}
      <div className="absolute bottom-8 right-8 max-w-sm bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="font-bold text-lg text-gray-900 mb-2">Your Visa Journey</h2>
        <p className="text-sm text-gray-600 mb-4">
          {startingVisaId === "start"
            ? "You're starting fresh! Explore various visa options to begin your U.S. journey."
            : `You're currently on the ${visaPaths.find((v) => v.id === startingVisaId)?.name} path. Explore next steps in your journey.`}
        </p>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌟</span>
            <span>Starting point - Your current visa</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <span>Recommended - Great next step</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">✓</span>
            <span>Available - You qualify</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🔒</span>
            <span>Locked - Requires more skills</span>
          </div>
        </div>
      </div>

      {/* CUSTOMIZATION GUIDE */}
      {/* 
        To customize the journey map:
        
        1. CHANGE STARTING VISA:
           - Edit userProfile.currentVisa in lib/mapData.ts
           - Set to null for "Start" node, or visa ID like "f1"
        
        2. ADD NEW VISA PATH:
           - Add to visaPaths array in lib/mapData.ts
           - Set tier, requirements, and previousVisas
        
        3. CHANGE TREE LAYOUT:
           - Edit calculateTreePositions() in lib/mapData.ts
           - Adjust x positions for tiers and y distribution
        
        4. MODIFY ELIGIBLE PATHS:
           - Edit getEligiblePaths() logic in lib/mapData.ts
           - Add filters for skill requirements
        
        5. CHANGE VISUAL STYLE:
           - mapConfig in lib/mapData.ts (colors, opacity, sizes)
           - Tier colors: modify visa.color and visa.badge
      */}
    </div>
  );
}
