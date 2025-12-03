/**
 * VISA MAP COMPONENT - JOURNEY-BASED LAYOUT WITH MATCHING
 * 
 * Displays visa paths as a journey starting from user's current visa
 * with real-time matching engine scoring.
 * 
 * Data Sources:
 * - Visa nodes: Dynamically loaded from visaKnowledgeBase (src/data/visaKnowledgeBase.ts)
 * - Visa edges: Generated from each visa's commonNextSteps field
 * - Match scores: Computed by matchUserToVisas (src/logic/matchingEngine.ts)
 * - User starting point: Either current visa or "START" node
 * 
 * Layout:
 * - Left to right flow (time progression)
 * - Hierarchical levels by category/difficulty
 * - Lines connecting related visa paths via commonNextSteps
 * - Interactive hover cards with match scores and reasons
 */

"use client";

import { useState, useMemo } from "react";
import { visaKnowledgeBase, Visa } from "@/src/data/visaKnowledgeBase";
import { UserProfile } from "@/lib/types";
import { matchUserToVisas } from "@/src/logic/matchingEngine";
import { VisaMatchResult } from "@/lib/types";
import {
  userProfile,
  userProfileWithSkills,
  getStartingVisa,
  calculateTreePositions,
  getVisaState,
  mapConfig,
} from "@/lib/mapData";

interface VisaNodeUI {
  id: string;
  name: string;
  category: string;
  description: string;
  difficulty?: "low" | "medium" | "high";
  timeHorizon?: "short" | "medium" | "long";
  notes?: string;
  nextSteps: string[];
  color: string;
  badge: string;
  match?: VisaMatchResult;  // Matching result for this visa
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
  edges,
}: {
  visasToShow: VisaNodeUI[];
  positions: Record<string, Position>;
  hoveredNodeId: string | null;
  edges: Array<{ from: string; to: string }>;
}) {
  /**
   * Draws lines connecting visa paths
   * Lines generated from each visa's commonNextSteps field
   * These edges represent the flow from one visa to the next
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

      {/* Draw connection lines from edges */}
      {edges.map(({ from, to }) => {
        const fromPos = positions[from];
        const toPos = positions[to];

        if (!fromPos || !toPos) return null;

        const x1 = (fromPos.x / 100) * viewBoxWidth;
        const y1 = (fromPos.y / 100) * viewBoxHeight;
        const x2 = (toPos.x / 100) * viewBoxWidth;
        const y2 = (toPos.y / 100) * viewBoxHeight;

        const isHighlighted = hoveredNodeId === to || hoveredNodeId === from;

        // Create curved path (quadratic Bezier)
        const midX = (x1 + x2) / 2;
        const controlX = midX + (x2 - x1) * 0.3;
        const pathData = `M ${x1} ${y1} Q ${controlX} ${(y1 + y2) / 2} ${x2} ${y2}`;

        return (
          <path
            key={`path-${from}-${to}`}
            d={pathData}
            className={`visa-path-line ${isHighlighted ? "highlighted" : ""}`}
          />
        );
      })}
    </svg>
  );
}

function VisaNodeElement({
  visa,
  state,
  position,
  isHovered,
  isCurrentVisa,
  onHover,
  onHoverEnd,
  onClick,
}: {
  visa: VisaNodeUI;
  state: string;
  position: Position;
  isHovered: boolean;
  isCurrentVisa: boolean;
  onHover: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
}) {
  /**
   * Individual visa node on the journey map
   * Current visa node is highlighted with larger size and glow
   */

  const isLocked = state === "locked";
  const statusColor =
    mapConfig.statusColors[state as keyof typeof mapConfig.statusColors];

  // Calculate size based on whether it's the current visa
  const nodeSize = isCurrentVisa ? 70 : mapConfig.nodeRadius;
  
  // Emoji based on category
  const categoryEmoji: Record<string, string> = {
    student: "🎓",
    work: "💼",
    immigrant: "🏆",
    investment: "💎",
    exchange: "🌍",
    other: "📋",
  };
  const emoji = categoryEmoji[visa.category] || "📋";

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
      {/* Glow effect for current visa node */}
      {isCurrentVisa && (
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
          border: isCurrentVisa
            ? "3px solid #3b82f6"
            : isLocked
              ? "2px dashed #d1d5db"
              : "2px solid #e5e7eb",
          boxShadow:
            isCurrentVisa && !isLocked
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
          {emoji}
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
        {isLocked ? "🔒" : isCurrentVisa ? "🌟" : state === "recommended" ? "⭐" : "✓"}
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

          {/* Category badges */}
          <div className="flex gap-2 mb-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${visa.badge}`}>
              {visa.category}
            </span>
            {visa.difficulty && (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {visa.difficulty}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3">{visa.description}</p>

          {/* Notes if available */}
          {visa.notes && (
            <p className="text-xs text-gray-500 mb-3 italic">{visa.notes}</p>
          )}

          {/* MATCH SCORE AND REASONS */}
          {visa.match && (
            <div className="mb-4 pb-4 border-t border-gray-200">
              {/* Match Score */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-700 mb-1">
                  Profile Match: <span className="text-blue-600">{visa.match.score}%</span>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${visa.match.score}%` }}
                  />
                </div>
              </div>

              {/* Reasons */}
              {visa.match.reasons.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">Why this match:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {visa.match.reasons.slice(0, 3).map((reason, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-blue-500 flex-shrink-0">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

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

export function VisaMap({
  recommendedVisas = [],
  userProfile: propsUserProfile,
}: {
  recommendedVisas?: string[];
  userProfile?: UserProfile;
}) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Use profile from props (loaded via hook) or fall back to default from mapData
  const effectiveUserProfile = propsUserProfile || (userProfile as any);

  // LOAD VISA KNOWLEDGE BASE DATA
  // Filter out visas with category "other" - only show relevant visa categories
  const filteredVisaKB = useMemo(
    () =>
      visaKnowledgeBase.filter(
        (visa) =>
          visa.category !== "other" && visa.category !== "exchange"
      ),
    []
  );

  // GENERATE NODES DYNAMICALLY FROM KNOWLEDGE BASE
  // Transform visa knowledge base entries into UI nodes with proper styling
  const visaNodes = useMemo((): VisaNodeUI[] => {
    return filteredVisaKB.map((visa) => {
      // Color mapping based on category
      const categoryColors: Record<string, { color: string; badge: string }> = {
        student: {
          color: "from-blue-400 to-blue-600",
          badge: "bg-blue-100 text-blue-700",
        },
        work: {
          color: "from-purple-400 to-purple-600",
          badge: "bg-purple-100 text-purple-700",
        },
        immigrant: {
          color: "from-red-400 to-red-600",
          badge: "bg-red-100 text-red-700",
        },
        investment: {
          color: "from-pink-400 to-pink-600",
          badge: "bg-pink-100 text-pink-700",
        },
        exchange: {
          color: "from-green-400 to-green-600",
          badge: "bg-green-100 text-green-700",
        },
      };

      const colors =
        categoryColors[visa.category] ||
        categoryColors.work;

      return {
        id: visa.id,
        name: visa.name,
        category: visa.category,
        description: visa.officialDescription,
        difficulty: visa.difficulty,
        timeHorizon: visa.timeHorizon,
        notes: visa.notes,
        nextSteps: visa.commonNextSteps || [],
        color: colors.color,
        badge: colors.badge,
      };
    });
  }, [filteredVisaKB]);

  // GENERATE EDGES DYNAMICALLY FROM commonNextSteps
  // Build edge list where each visa's commonNextSteps creates connections
  const edges = useMemo(() => {
    const edgeList: Array<{ from: string; to: string }> = [];

    visaNodes.forEach((visa) => {
      visa.nextSteps.forEach((nextVisaId) => {
        // Only add edge if both visas exist in our filtered list
        if (visaNodes.find((v) => v.id === nextVisaId)) {
          edgeList.push({ from: visa.id, to: nextVisaId });
        }
      });
    });

    return edgeList;
  }, [visaNodes]);

  // DETERMINE STARTING POINT: User's current visa or "START" node
  const currentVisa = effectiveUserProfile.currentVisa;
  
  // Build list of visas to show:
  // - If user has current visa: show that + all reachable visas
  // - If user has no visa: show all entry-level visas (student, work)
  const visasToShow = useMemo(() => {
    if (currentVisa) {
      // User has a current visa - show it and all reachable visas
      const visited = new Set<string>();
      const toVisit = [currentVisa];

      while (toVisit.length > 0) {
        const visaId = toVisit.pop();
        if (!visaId || visited.has(visaId)) continue;
        visited.add(visaId);

        // Find all visas reachable from this one (via commonNextSteps)
        const nextVisas = edges
          .filter((e) => e.from === visaId)
          .map((e) => e.to);

        toVisit.push(...nextVisas);
      }

      return visaNodes.filter((v) => visited.has(v.id));
    } else {
      // User has no visa - show entry-level visas only
      return visaNodes.filter(
        (v) => v.category === "student" || v.category === "work"
      );
    }
  }, [currentVisa, visaNodes, edges]);

  // Calculate tree positions for all visible visas
  const positions = useMemo(
    () => calculateTreePositions(visasToShow),
    [visasToShow]
  );

  // COMPUTE MATCHING SCORES
  // Use the matching engine to score each visa based on user profile
  // Returns visas sorted by score (highest first)
  const matchResults = useMemo(() => {
    // Convert VisaNodeUI back to Visa for matching engine
    const visasForMatching = filteredVisaKB;
    return matchUserToVisas(effectiveUserProfile as any, visasForMatching);
  }, [effectiveUserProfile, filteredVisaKB]);

  // ADD MATCH RESULTS TO VISIBLE VISA NODES
  // Map match results back to visa nodes for display
  const visasToShowWithMatches = useMemo(() => {
    const matchMap = new Map(matchResults.map((m) => [m.visaId, m]));
    return visasToShow.map((visa) => ({
      ...visa,
      match: matchMap.get(visa.id),
    }));
  }, [visasToShow, matchResults]);

  return (
    <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Background grid and decorations */}
      <AbstractMapBackground />

      {/* Path lines connecting visa nodes via commonNextSteps */}
      <PathLines
        visasToShow={visasToShow}
        positions={positions}
        hoveredNodeId={hoveredNodeId}
        edges={edges.filter((e) => {
          const fromExists = visasToShowWithMatches.find((v) => v.id === e.from);
          const toExists = visasToShowWithMatches.find((v) => v.id === e.to);
          return fromExists && toExists;
        })}
      />

      {/* Visa nodes */}
      <div className="relative w-full h-full">
        {visasToShowWithMatches.map((visa: VisaNodeUI) => {
          const baseState = getVisaState(
            visa as any,
            userProfileWithSkills.skills
          );
          // Override state to "recommended" if this visa is in recommendedVisas
          const state = recommendedVisas.includes(visa.id) ? "recommended" : baseState;
          const isCurrentVisa = visa.id === currentVisa;
          const pos = positions[visa.id];

          if (!pos) return null;

          return (
            <VisaNodeElement
              key={visa.id}
              visa={visa}
              state={state}
              position={pos}
              isHovered={hoveredNodeId === visa.id}
              isCurrentVisa={isCurrentVisa}
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
          {!currentVisa
            ? "You're starting fresh! Explore various visa options to begin your U.S. journey."
            : `You're currently on the ${visaNodes.find((v) => v.id === currentVisa)?.name} path. Explore next steps in your journey.`}
        </p>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌟</span>
            <span>Current visa - Your starting point</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <span>Recommended - May be eligible</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">✓</span>
            <span>Available - Could be a path</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🔒</span>
            <span>Locked - Strengthen skills first</span>
          </div>
        </div>
      </div>

      {/* CUSTOMIZATION GUIDE */}
      {/* 
        To customize the journey map:
        
        1. VISA DATA FLOW:
           - Visa definitions come from: src/data/visaKnowledgeBase.ts
           - Edges are generated from: visa.commonNextSteps field
           - Filtered categories: student, work, immigrant, investment
        
        2. CURRENT VISA HIGHLIGHT:
           - If user has currentVisa: shown with blue glow and 🌟 badge
           - If no currentVisa: shows entry-level student/work visas
        
        3. CHANGE STARTING VISA:
           - Edit userProfile.currentVisa in lib/mapData.ts
           - Set to null for "no visa" mode, or visa ID like "f1"
        
        4. MODIFY CATEGORY COLORS:
           - Update categoryColors map in this component
           - Colors applied based on visa.category
        
        5. CHANGE TREE LAYOUT:
           - Edit calculateTreePositions() in lib/mapData.ts
           - Adjust x positions for tiers and y distribution
        
        6. MODIFY VISUAL STYLE:
           - mapConfig in lib/mapData.ts (colors, opacity, sizes)
      */}
    </div>
  );
}
