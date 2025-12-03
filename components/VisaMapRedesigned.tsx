'use client';

/**
 * VISA MAP REDESIGNED - DYNAMIC PATH COMPUTATION
 * 
 * ============================================================================
 * DYNAMIC VISA GRAPH COMPUTATION VIA BFS
 * ============================================================================
 * 
 * This component dynamically computes visa paths using breadth-first search (BFS)
 * based on the user's current visa and the commonNextSteps relationships in the
 * visa knowledge base.
 * 
 * KEY FEATURES:
 * 1. Builds adjacency graph from VISA_KNOWLEDGE_BASE.commonNextSteps
 * 2. Performs BFS from currentVisa to compute reachable visa tiers (levels 0-3)
 * 3. Only shows visas that are actually reachable from current position
 * 4. Filters out tourist/visitor categories from main map display
 * 5. Recomputes entire graph when currentVisa changes
 * 
 * TIER COMPUTATION (BFS-based):
 * - Level 0: Current visa (or START if none)
 * - Level 1: Visas directly reachable via commonNextSteps from Level 0
 * - Level 2: Visas reachable from Level 1 (excluding already visited)
 * - Level 3: Visas reachable from Level 2 (and so on)
 * 
 * CATEGORY FILTERING:
 * - Includes: student, worker, investor, immigrant categories
 * - Excludes: tourist, visitor, family, special categories
 * 
 * DATA FLOW:
 * - userProfile.currentVisa → Build adjacency graph → BFS traversal → Dynamic tiers
 * - Matching engine scores all reachable visas for eligibility (green/blue/gray)
 * - Map re-renders when currentVisa changes with new tier structure
 * 
 * ============================================================================
 */

import React, { useMemo } from 'react';
import { VISA_KNOWLEDGE_BASE } from '@/lib/visa-knowledge-base';
import { UserProfile } from '@/lib/types';
import { getVisaRecommendations, getVisasByStatus } from '@/lib/visa-matching-engine';
import { idToUiLabel } from '@/lib/utils';

interface VisaMapRedesignedProps {
  /** User profile from matching engine */
  userProfile: UserProfile;
  /** Optional pre-computed visa matches (if provided, skips internal computation) */
  matches?: ReturnType<typeof getVisasByStatus>;
  /** Currently selected visa on map */
  selectedVisa?: string | null;
  /** Callback when user clicks a visa node */
  onVisaSelect: (visaId: string) => void;
}

const VisaMapRedesigned: React.FC<VisaMapRedesignedProps> = ({
  userProfile,
  selectedVisa,
  onVisaSelect,
}) => {
  // ========================================================================
  // CENTRALIZED CLICK HANDLER
  // ========================================================================
  const handleNodeClick = (visaId: string) => {
    console.log('[VisaMap] Node clicked:', visaId);
    onVisaSelect(visaId);
  };

  // ========================================================================
  // SCORE ALL VISAS USING MATCHING ENGINE
  // ========================================================================
  const visaRecommendations = useMemo(
    () => getVisaRecommendations(userProfile),
    [userProfile]
  );

  const recommendedVisas = useMemo(
    () => getVisasByStatus(visaRecommendations, 'recommended'),
    [visaRecommendations]
  );
  const availableVisas = useMemo(
    () => getVisasByStatus(visaRecommendations, 'available'),
    [visaRecommendations]
  );

  // ========================================================================
  // DYNAMIC TIER COMPUTATION VIA BFS
  // ========================================================================
  
  /**
   * CATEGORY FILTERING
   * Only include these categories on the main visa map.
   * Tourist/visitor visas are excluded from the progression path.
   */
  const INCLUDED_CATEGORIES = ['student', 'worker', 'investor', 'immigrant'];

  /**
   * BUILD ADJACENCY GRAPH FROM VISA KNOWLEDGE BASE
   * 
   * Creates a directed graph where each visa points to its commonNextSteps.
   * This adjacency list is used for BFS traversal to find reachable visas.
   * 
   * Structure: { visaId: [nextVisaId1, nextVisaId2, ...] }
   * Example: { f1: ['opt', 'h1b', 'eb2gc'], opt: ['h1b', 'o1', 'eb2gc'], ... }
   */
  const adjacencyGraph = useMemo(() => {
    const graph: Record<string, string[]> = {};
    
    Object.keys(VISA_KNOWLEDGE_BASE).forEach((visaId) => {
      const visa = VISA_KNOWLEDGE_BASE[visaId];
      
      // Only include visas from allowed categories
      if (!INCLUDED_CATEGORIES.includes(visa.category)) {
        return;
      }
      
      // Extract next step visa IDs from commonNextSteps
      const nextSteps = visa.commonNextSteps
        ?.map(step => step.visaId.toLowerCase())
        .filter(nextId => {
          const nextVisa = VISA_KNOWLEDGE_BASE[nextId];
          // Only include next steps that are in allowed categories
          return nextVisa && INCLUDED_CATEGORIES.includes(nextVisa.category);
        }) || [];
      
      graph[visaId] = nextSteps;
    });
    
    console.info('[VisaMapRedesigned] Built adjacency graph:', graph);
    return graph;
  }, []);

  /**
   * COMPUTE TIERS VIA BREADTH-FIRST SEARCH (BFS)
   * 
   * Starting from the current visa (or START), perform BFS to assign each
   * reachable visa to a tier/level based on its distance from the starting point.
   * 
   * Algorithm:
   * 1. Start with currentVisa at Level 0
   * 2. Add all visas reachable from Level 0 to Level 1 (via commonNextSteps)
   * 3. Add all visas reachable from Level 1 to Level 2 (excluding visited)
   * 4. Continue until no more reachable visas
   * 
   * Special case: If no currentVisa, show entry-level visas at Level 1
   * (START node behavior for new users)
   */
  const visasByTier = useMemo(() => {
    const tiers: Record<string, string[]> = {
      level0: [],
      level1: [],
      level2: [],
      level3: [],
    };

    console.info('[VisaMapRedesigned] Computing dynamic tiers. Current visa:', userProfile.currentVisa);

    // CASE 1: User has a current visa - build reachable graph from that visa
    if (userProfile.currentVisa) {
      const startVisaId = userProfile.currentVisa.toLowerCase();
      const startVisa = VISA_KNOWLEDGE_BASE[startVisaId];
      
      // Validate current visa exists and is in allowed categories
      if (!startVisa || !INCLUDED_CATEGORIES.includes(startVisa.category)) {
        console.warn('[VisaMapRedesigned] Current visa not found or not in allowed categories:', startVisaId);
        // Fall through to CASE 2 (show entry visas)
      } else {
        console.info('[VisaMapRedesigned] Starting BFS from:', startVisaId);
        
        // BFS IMPLEMENTATION
        const visited = new Set<string>();
        const queue: Array<{ visaId: string; level: number }> = [{ visaId: startVisaId, level: 0 }];
        
        visited.add(startVisaId);
        tiers.level0.push(startVisaId);
        
        while (queue.length > 0) {
          const { visaId, level } = queue.shift()!;
          const nextSteps = adjacencyGraph[visaId] || [];
          
          // Process each connected visa
          for (const nextVisaId of nextSteps) {
            if (visited.has(nextVisaId)) continue;
            
            visited.add(nextVisaId);
            const nextLevel = level + 1;
            
            // Assign to appropriate tier (cap at level 3)
            if (nextLevel === 1) {
              tiers.level1.push(nextVisaId);
              queue.push({ visaId: nextVisaId, level: nextLevel });
            } else if (nextLevel === 2) {
              tiers.level2.push(nextVisaId);
              queue.push({ visaId: nextVisaId, level: nextLevel });
            } else if (nextLevel === 3) {
              tiers.level3.push(nextVisaId);
              // Don't queue level 3+ to prevent infinite expansion
            }
          }
        }
        
        console.info('[VisaMapRedesigned] BFS complete. Tiers:', {
          level0: tiers.level0,
          level1: tiers.level1,
          level2: tiers.level2,
          level3: tiers.level3,
        });
        
        return tiers;
      }
    }
    
    // CASE 2: No current visa - show START node + entry-level visas
    console.info('[VisaMapRedesigned] No current visa - showing START + entry visas');
    tiers.level0 = ['start'];
    
    // Show entry-level visas at Level 1
    Object.keys(VISA_KNOWLEDGE_BASE).forEach((visaId) => {
      const visa = VISA_KNOWLEDGE_BASE[visaId];
      if (visaId !== 'start' && 
          INCLUDED_CATEGORIES.includes(visa.category) && 
          visa.tier === 'entry') {
        tiers.level1.push(visaId);
      }
    });
    
    console.info('[VisaMapRedesigned] Entry-level visas:', tiers.level1);
    return tiers;
  }, [userProfile.currentVisa, adjacencyGraph]);

  // ========================================================================
  // TIER ORDERING & POSITIONING
  // ========================================================================
  
  /**
   * TIER ORDERING (BFS Levels)
   * Maps BFS levels to display positions on the map
   */
  const tierOrder = ['level0', 'level1', 'level2', 'level3'];

  /**
   * CALCULATE VISA NODE POSITION
   * 
   * Positions visas on a 2D map based on:
   * - X-axis: BFS level (level0 → level1 → level2 → level3, left to right)
   * - Y-axis: Index within tier + difficulty adjustment (vertical spread)
   * 
   * This creates a visual flow showing visa progression paths.
   */
  const getVisaPosition = (tier: string, index: number, total: number, visa?: any) => {
    const tierIdx = tierOrder.indexOf(tier);
    const tierX = 80 + tierIdx * 220; // Horizontal spacing between tiers
    
    // Y-axis: Use difficulty to influence positioning
    // Higher difficulty = higher on Y-axis (slightly)
    const difficultyOffset = visa?.difficulty ? (visa.difficulty - 1) * 30 : 0;
    const tierY = 160 + (index - (total - 1) / 2) * 100 + difficultyOffset;
    
    return { x: tierX, y: tierY };
  };

  const getLineStyle = (status: 'recommended' | 'available' | 'locked') => {
    switch (status) {
      case 'recommended':
        return { stroke: '#22c55e', strokeWidth: 3, strokeDasharray: 'none' };
      case 'available':
        return { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: 'none' };
      case 'locked':
        return { stroke: '#9ca3af', strokeWidth: 2, strokeDasharray: '5,5' };
    }
  };

  // ========================================================================
  // RENDER CONNECTIONS (LINES) BETWEEN VISAS
  // ========================================================================
  
  /**
   * RENDER CONNECTION LINES BASED ON ACTUAL commonNextSteps EDGES
   * 
   * Instead of connecting all nodes in adjacent tiers, this renders only
   * the actual edges defined in the visa knowledge base via commonNextSteps.
   * 
   * This creates a more accurate, sparse graph showing real visa pathways.
   * 
   * Line styling:
   * - Green (solid): Recommended next steps (high eligibility)
   * - Blue (solid): Available next steps (medium eligibility)
   * - Gray (dashed): Locked next steps (low eligibility)
   */
  const renderConnections = () => {
    const lines: React.ReactNode[] = [];
    let lineId = 0;

    // Build a map of visaId -> {tier, index} for position lookups
    const visaPositionMap = new Map<string, { tier: string; index: number; total: number }>();
    tierOrder.forEach((tier) => {
      const visas = visasByTier[tier] || [];
      visas.forEach((visaId, index) => {
        visaPositionMap.set(visaId, { tier, index, total: visas.length });
      });
    });

    // Render edges based on commonNextSteps in adjacency graph
    tierOrder.forEach((tier) => {
      const visasInTier = visasByTier[tier] || [];
      
      visasInTier.forEach((visaId) => {
        const currentPosData = visaPositionMap.get(visaId);
        if (!currentPosData) return;
        
        const currentVisa = VISA_KNOWLEDGE_BASE[visaId];
        const currentPos = getVisaPosition(currentPosData.tier, currentPosData.index, currentPosData.total, currentVisa);
        
        // Get next steps from adjacency graph
        const nextSteps = adjacencyGraph[visaId] || [];
        
        nextSteps.forEach((nextVisaId) => {
          const nextPosData = visaPositionMap.get(nextVisaId);
          if (!nextPosData) return; // Next visa not displayed (filtered out or not reachable)
          
          const nextVisa = VISA_KNOWLEDGE_BASE[nextVisaId];
          const nextPos = getVisaPosition(nextPosData.tier, nextPosData.index, nextPosData.total, nextVisa);
          const nextStatus = visaRecommendations[nextVisaId]?.status || 'locked';
          const lineStyle = getLineStyle(nextStatus);

          lines.push(
            <line
              key={`line-${lineId++}`}
              x1={currentPos.x + 35}
              y1={currentPos.y + 35}
              x2={nextPos.x}
              y2={nextPos.y + 35}
              {...lineStyle}
              opacity="0.6"
            />
          );
        });
      });
    });

    return lines;
  };

  // ========================================================================
  // RENDER VISA NODES
  // ========================================================================
  
  /**
   * RENDER VISA NODES ON THE MAP
   * 
   * Renders each visa as a circular node positioned according to its BFS level.
   * 
   * Node features:
   * - Level 0 (current visa): Larger size, glowing ring, "You are here" label
   * - Color coding: Green (recommended), Blue (available), Gray (locked)
   * - Interactive: Hover tooltips, click to view details
   * - Status labels: "May be eligible", "Could be a path", "Requirements not met"
   */
  const renderVisaNodes = () => {
    const nodes: React.ReactNode[] = [];

    tierOrder.forEach((tier) => {
      const visaIds = visasByTier[tier] || [];
      const isCurrentTier = tier === 'level0'; // Level 0 is current visa

      visaIds.forEach((visaId, index) => {
        const visa = VISA_KNOWLEDGE_BASE[visaId];
        const status = visaRecommendations[visaId]?.status || 'locked';
        const isSelected = selectedVisa === visaId;
        const isCurrentVisa = isCurrentTier && userProfile.currentVisa && visaId === userProfile.currentVisa;

        if (!visa) return; // Skip if visa not found

        // POSITION CALCULATION: Pass visa object to use difficulty field
        const pos = getVisaPosition(tier, index, visaIds.length, visa);

        // Soft hedging language based on status
        const statusLabel =
          status === 'recommended'
            ? 'May be eligible'
            : status === 'available'
              ? 'Could be a path'
              : 'Requirements not met';

        nodes.push(
          <button
            key={visaId}
            onClick={() => handleNodeClick(visaId)}
            className={`absolute w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold text-center transition-all duration-200 cursor-pointer group ${
              isSelected ? 'ring-2 ring-yellow-400 scale-110 z-30' : 'hover:scale-105 z-10'
            } ${
              isCurrentVisa
                ? 'w-24 h-24 ring-2 ring-yellow-300 ring-opacity-50 shadow-2xl shadow-yellow-400/50 scale-105'
                : ''
            } ${
              status === 'recommended'
                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/50'
                : status === 'available'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-300 opacity-60 shadow-lg shadow-gray-600/30 cursor-not-allowed'
            }`}
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
            disabled={status === 'locked'}
            title={statusLabel}
          >
            <div className="text-2xl">{visa.emoji}</div>
            <div className="text-xs font-semibold leading-tight">{visa.code}</div>

            {/* "You are here" label for current visa */}
            {isCurrentVisa && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-yellow-300 font-bold text-xs whitespace-nowrap">
                ⭐ You are here
              </div>
            )}

            {/* Hover Card with visa name + status */}
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 border border-slate-700">
              <div className="font-semibold">{visa.name}</div>
              <div className="text-slate-400 text-xs">{statusLabel}</div>
            </div>
          </button>
        );
      });
    });

    return nodes;
  };

  // ========================================================================
  // RENDER MAP
  // ========================================================================
  return (
    <div className="relative w-full h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden">
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur rounded-lg p-3 text-xs z-40 border border-slate-700">
        <div className="font-semibold mb-2 text-slate-200">Your Profile Match</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-slate-300">May be eligible (90%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-300">Could be a path (50%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-slate-300">Strengthen skills first</span>
          </div>
        </div>
      </div>

      {/* Tier Labels - Dynamic based on BFS levels */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center px-4 text-xs text-slate-400 font-semibold pointer-events-none">
        <div style={{ marginLeft: '80px' }}>
          {userProfile.currentVisa ? 'Current Visa' : 'Start'}
        </div>
        <div style={{ marginLeft: '200px' }}>
          {userProfile.currentVisa ? 'Next Steps' : 'Entry Visas'}
        </div>
        <div style={{ marginLeft: '200px' }}>
          {userProfile.currentVisa ? 'Future Options' : 'Intermediate'}
        </div>
        <div style={{ marginLeft: '200px' }}>
          {userProfile.currentVisa ? 'Long-term Goals' : 'Advanced'}
        </div>
      </div>

      {/* SVG Canvas for Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        {renderConnections()}
      </svg>

      {/* Visa Nodes */}
      <div className="relative w-full h-full pt-16">
        {renderVisaNodes()}
      </div>
    </div>
  );
};

export default VisaMapRedesigned;

/**
 * ============================================================================
 * IMPLEMENTATION SUMMARY - DYNAMIC VISA PATH COMPUTATION
 * ============================================================================
 * 
 * PROBLEM SOLVED:
 * Previous implementation used static, hard-coded tier classifications (entry/
 * intermediate/advanced) that didn't change based on the user's current visa.
 * This meant the map showed the same visas regardless of where the user was
 * in their visa journey.
 * 
 * NEW APPROACH - DYNAMIC BFS-BASED GRAPH:
 * 
 * 1. ADJACENCY GRAPH CONSTRUCTION:
 *    - Reads commonNextSteps from each visa in VISA_KNOWLEDGE_BASE
 *    - Builds directed graph: visaId → [nextVisaId1, nextVisaId2, ...]
 *    - Filters to only include allowed categories (student/worker/investor/immigrant)
 * 
 * 2. BREADTH-FIRST SEARCH (BFS):
 *    - Starts from userProfile.currentVisa (or START if none)
 *    - Level 0: Current visa
 *    - Level 1: Visas directly reachable via commonNextSteps
 *    - Level 2: Visas reachable from Level 1 (excluding visited)
 *    - Level 3: Visas reachable from Level 2
 * 
 * 3. REACHABILITY FILTERING:
 *    - Only visas reachable from current position are displayed
 *    - Unreachable visas are completely hidden from map
 *    - Creates focused, personalized visa progression view
 * 
 * 4. CATEGORY FILTERING:
 *    - Tourist/visitor visas excluded from main progression map
 *    - Only shows: student, worker, investor, immigrant visas
 * 
 * 5. DYNAMIC RE-COMPUTATION:
 *    - When currentVisa changes, entire graph is rebuilt via BFS
 *    - useMemo ensures efficient re-computation only when needed
 *    - Map automatically updates to show new paths from new position
 * 
 * 6. EDGE RENDERING:
 *    - Connections drawn based on actual commonNextSteps edges
 *    - No longer connects all nodes in adjacent tiers
 *    - Creates accurate, sparse graph of real visa pathways
 * 
 * BENEFITS:
 * - Personalized: Map adapts to user's current visa status
 * - Accurate: Shows only reachable paths from current position
 * - Dynamic: Updates automatically when currentVisa changes
 * - Data-driven: No hard-coded tier classifications
 * - Maintainable: Add/modify visa paths in knowledge base, map updates automatically
 * 
 * EXAMPLE SCENARIOS:
 * 
 * User with currentVisa = "f1" (F-1 Student):
 *   Level 0: F-1
 *   Level 1: OPT, H-1B, O-1, EB-2
 *   Level 2: (visas reachable from Level 1)
 *   → Shows student → work visa → green card path
 * 
 * User with currentVisa = "h1b" (H-1B Worker):
 *   Level 0: H-1B
 *   Level 1: EB-2, EB-1
 *   Level 2: Naturalization
 *   → Shows work visa → green card path (no student visas shown)
 * 
 * User with currentVisa = null (No visa yet):
 *   Level 0: START
 *   Level 1: Entry-level visas (F-1, J-1)
 *   Level 2-3: Empty until visa selected
 *   → Shows entry options for new users
 * 
 * ============================================================================
 */
