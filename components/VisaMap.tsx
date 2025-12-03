/**
 * VISA MAP COMPONENT (Right main area)
 * 
 * Displays an abstract conceptual map with visa nodes and paths.
 * Nodes show locked/unlocked/recommended states based on user's skill tree.
 * Visual design inspired by isometric dashboards and data visualizations.
 */

"use client";

import { useState } from "react";
import { visaPaths, mapConfig, userProfile, getVisaState } from "@/lib/mapData";

interface VisaNode {
  id: string;
  name: string;
  emoji: string;
  description: string;
  fullDescription: string;
  category: string;
  position: { x: number; y: number };
  color: string;
  badge: string;
  relatedVisas: string[];
}

interface HoveredNode {
  id: string;
  position: { x: number; y: number };
}

function AbstractMapBackground() {
  /**
   * Renders the abstract map background with grid lines and subtle design elements
   * CUSTOMIZE: Change grid spacing, colors, and opacity in mapConfig (lib/mapData.ts)
   */

  const gridLines = [];
  const canvasWidth = 1400; // Approximate canvas width
  const canvasHeight = 800; // Approximate canvas height

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

      {/* Decorative corner circles (optional visual elements) */}
      <circle cx="5%" cy="5%" r="80" fill="url(#gradientCorner)" opacity="0.1" />
      <circle cx="95%" cy="95%" r="100" fill="url(#gradientCorner)" opacity="0.1" />

      {/* Gradient definitions */}
      <defs>
        <radialGradient id="gradientCorner">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e40af" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function VisaNodeElement({
  visa,
  state,
  isHovered,
  onHover,
  onHoverEnd,
  onClick,
}: {
  visa: VisaNode;
  state: string;
  isHovered: boolean;
  onHover: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
}) {
  /**
   * Individual visa node on the map
   * CUSTOMIZE:
   * - nodeRadius, nodeHoverScale in mapConfig for size
   * - Colors via visa.color and visa.badge props
   * - Status badge colors via mapConfig.statusColors
   */

  const isLocked = state === "locked";
  const isRecommended = state === "recommended";

  // Calculate position as percentage for responsive design
  const x = `${visa.position.x}%`;
  const y = `${visa.position.y}%`;

  // Get status color from config
  const statusColor = mapConfig.statusColors[state as keyof typeof mapConfig.statusColors];

  return (
    <div
      className="absolute transition-all duration-300 cursor-pointer"
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        zIndex: isHovered ? 50 : 10,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      onClick={onClick}
    >
      {/* Main node circle */}
      <div
        className="flex items-center justify-center rounded-full transition-all duration-300 shadow-md hover:shadow-xl"
        style={{
          width: `${mapConfig.nodeRadius}px`,
          height: `${mapConfig.nodeRadius}px`,
          opacity: isLocked ? mapConfig.nodeLockedOpacity : mapConfig.nodeUnlockedOpacity,
          transform: isHovered ? `scale(${mapConfig.nodeHoverScale})` : "scale(1)",
          backgroundColor: isLocked
            ? "#f3f4f6" // Gray for locked
            : visa.color.startsWith("from-")
              ? "#ffffff" // Will use border + shadow for gradient effect
              : "white",
          border: isLocked ? "2px dashed #d1d5db" : "2px solid #e5e7eb",
          background: isLocked
            ? "#f3f4f6"
            : `linear-gradient(135deg, var(--tw-gradient-stops))`,
          "--tw-gradient-from": visa.color.split(" ")[1],
          "--tw-gradient-to": visa.color.split(" ")[3],
        } as React.CSSProperties}
      >
        {/* Emoji */}
        <span className="text-3xl drop-shadow-md">{visa.emoji}</span>
      </div>

      {/* Status badge */}
      <div
        className="absolute -top-2 -right-2 px-2 py-1 text-xs font-semibold rounded-full shadow-sm"
        style={{
          backgroundColor: statusColor.bg,
          color: statusColor.text,
        }}
      >
        {isLocked ? "🔒" : isRecommended ? "⭐" : "✓"}
      </div>

      {/* Lock overlay (if locked) */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/30">
          <span className="text-xl">🔒</span>
        </div>
      )}

      {/* Hover tooltip/card */}
      {isHovered && (
        <div
          className="absolute left-20 top-1/2 -translate-y-1/2 w-64 bg-white rounded-xl shadow-xl p-4 border border-gray-200 z-50"
          style={{
            animation: "slideIn 150ms ease-out",
          }}
        >
          {/* Visa name */}
          <h3 className="font-bold text-lg text-gray-900 mb-1">{visa.name}</h3>

          {/* Category badge */}
          <div className="inline-block mb-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${visa.badge}`}>
              {visa.category}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3">{visa.description}</p>

          {/* Status indicator */}
          <div className="mb-4 pb-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-700">
              Status: <span style={{ color: statusColor.text }}>{state.toUpperCase()}</span>
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
            {isLocked ? "Unlock Skills to Access" : "Learn More"}
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

function PathLines({ hoveredNodeId }: { hoveredNodeId: string | null }) {
  /**
   * Draws lines connecting related visa paths
   * CUSTOMIZE: Change pathColor, pathOpacity, pathWidth in mapConfig
   * 
   * Note: Using SVG viewBox for responsive path drawing without document API
   */

  const viewBoxWidth = 1400;
  const viewBoxHeight = 800;

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none" 
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      preserveAspectRatio="xMidYMid slice"
    >
      {visaPaths.map((visa) => {
        return visa.relatedVisas.map((relatedId) => {
          const related = visaPaths.find((v) => v.id === relatedId);
          if (!related) return null;

          const isHighlighted =
            hoveredNodeId === visa.id || hoveredNodeId === relatedId;

          // Convert percentage positions to viewBox coordinates
          const x1 = (visa.position.x / 100) * viewBoxWidth;
          const y1 = (visa.position.y / 100) * viewBoxHeight;
          const x2 = (related.position.x / 100) * viewBoxWidth;
          const y2 = (related.position.y / 100) * viewBoxHeight;

          return (
            <line
              key={`path-${visa.id}-${relatedId}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={mapConfig.pathColor}
              strokeWidth={mapConfig.pathWidth}
              opacity={isHighlighted ? mapConfig.pathHoverOpacity : mapConfig.pathOpacity}
              className="transition-all duration-300"
            />
          );
        });
      })}
    </svg>
  );
}

export function VisaMap() {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedVisa, setSelectedVisa] = useState<string | null>(null);

  // CUSTOMIZE: Visa states are determined by getVisaState() function
  // Edit logic in lib/mapData.ts to change how states are calculated

  return (
    <div
      className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50"
      data-map-container
    >
      {/* Background grid and decorations */}
      <AbstractMapBackground />

      {/* Path lines connecting visa nodes */}
      <PathLines hoveredNodeId={hoveredNodeId} />

      {/* Visa nodes */}
      <div className="relative w-full h-full">
        {visaPaths.map((visa) => {
          const state = getVisaState(visa, userProfile.skills);

          return (
            <VisaNodeElement
              key={visa.id}
              visa={visa}
              state={state}
              isHovered={hoveredNodeId === visa.id}
              onHover={() => setHoveredNodeId(visa.id)}
              onHoverEnd={() => setHoveredNodeId(null)}
              onClick={() => {
                if (state !== "locked") {
                  setSelectedVisa(visa.id);
                  // CUSTOMIZE: Add navigation or modal logic here
                  console.log(`Selected visa: ${visa.name}`);
                }
              }}
            />
          );
        })}
      </div>

      {/* Info panel (bottom right) */}
      <div className="absolute bottom-8 right-8 max-w-sm bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="font-bold text-lg text-gray-900 mb-2">Abstract Visa Map</h2>
        <p className="text-sm text-gray-600 mb-4">
          Explore visa options based on your skills and qualifications. 
          Locked nodes require additional skills to unlock.
        </p>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔒</span>
            <span>Locked - Requires more skills</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">✓</span>
            <span>Available - You qualify</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <span>Recommended - Great fit</span>
          </div>
        </div>
      </div>

      {/* CUSTOMIZATION GUIDE */}
      {/* 
        To customize the map:
        
        1. CHANGE VISA POSITIONS:
           - Edit position.x and position.y in visaPaths (lib/mapData.ts)
           - Values are percentages (0-100) of container width/height
        
        2. CHANGE MAP STYLE:
           - Grid colors, spacing: mapConfig in lib/mapData.ts
           - Node colors, sizes: mapConfig constants
           - Background: AbstractMapBackground component
        
        3. CHANGE VISA REQUIREMENTS:
           - Edit requirements object for each visa in visaPaths
           - Modify getVisaState() function logic
        
        4. ADD NEW VISA:
           - Add new object to visaPaths array with id, name, position, etc.
        
        5. CUSTOMIZE CONNECTIONS:
           - Edit relatedVisas array in each visa object to show path connections
      */}
    </div>
  );
}
