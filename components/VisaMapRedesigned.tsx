'use client';

/**
 * VISA MAP REDESIGNED - PHASE 4 WITH KNOWLEDGE BASE INTEGRATION
 * 
 * ============================================================================
 * INTEGRATION WITH NEW VISA KNOWLEDGE BASE & MATCHING ENGINE
 * ============================================================================
 * 
 * This component now:
 * 1. Uses visa knowledge base (VISA_KNOWLEDGE_BASE) for all visa data
 * 2. Calls matching engine (getVisaRecommendations) to score visas
 * 3. Shows user's currentVisa as Level 0 starting point
 * 4. Hides generic START node if user has current visa
 * 5. Displays visa eligibility with soft language ("may be eligible")
 * 
 * DATA FLOW:
 * - Input: userProfile (UserProfile object from matching engine)
 * - userProfile contains: education, experience, field, country, language, investment, currentVisa
 * - Engine scores all visas and returns: recommended/available/locked status
 * - Component renders tiers based on scores and currentVisa
 * 
 * STARTING POINT LOGIC:
 * - If userProfile.currentVisa is NULL: Show START node at Level 0
 * - If userProfile.currentVisa is "f1": Show F-1 visa as Level 0 with highlight
 * - Level 0 visa node is larger, glowing, labeled "You are here (Current visa: F-1)"
 * 
 * MAP LAYOUT:
 * - Level 0: Current visa (or START if none) - HIGHLIGHTED
 * - Level 1: Entry-level visas (F-1, J-1, B-2)
 * - Level 2: Intermediate visas (OPT, H-1B, L-1B, O-1)
 * - Level 3: Advanced visas (EB-5, EB-2GC, EB-1A, EB-1C)
 * 
 * NODE COLORS:
 * - Green: Recommended (90%+ requirements match)
 * - Blue: Available (50%+ requirements match)
 * - Gray/Dashed: Locked (<50% requirements match)
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
  onVisaSelect: (visaCode: string) => void;
}

const VisaMapRedesigned: React.FC<VisaMapRedesignedProps> = ({
  userProfile,
  selectedVisa,
  onVisaSelect,
}) => {
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
  // ORGANIZE VISAS BY TIER + STARTING POINT
  // ========================================================================
  // FILTER CATEGORIES (exclude tourist visas):
  // - Include: student, worker, investor, immigrant
  // - Exclude: tourist, visitor, family, special
  const INCLUDED_CATEGORIES = ['student', 'worker', 'investor', 'immigrant'];

  const visasByTier = useMemo(() => {
    const tiers: Record<string, string[]> = {
      current: [], // Level 0: User's current visa (if any) or START
      entry: [],
      intermediate: [],
      advanced: [],
    };

    console.info('[VisaMapRedesigned] Building visa tier structure. Current visa from profile:', userProfile.currentVisa);

    // Level 0: Current visa or START node
    if (userProfile.currentVisa) {
      // User has visa: show that visa as starting point
      // But only if it's a work/long-term visa (not tourist)
      // IMPORTANT: currentVisa is already in knowledge base format (f1, h1b, etc.) - no normalization needed
      const visaId = userProfile.currentVisa;
      const currentVisa = VISA_KNOWLEDGE_BASE[visaId];
      
      console.info('[VisaMapRedesigned] Building visa tier structure. Current visa from profile:', visaId);
      console.info('[VisaMapRedesigned] Looking up visa in knowledge base:', visaId);
      console.info('[VisaMapRedesigned] Found visa definition:', currentVisa ? `${currentVisa.name} (${currentVisa.category})` : 'NOT FOUND');
      
      if (currentVisa && INCLUDED_CATEGORIES.includes(currentVisa.category)) {
        console.info('[VisaMapRedesigned] ✓ Current visa is eligible (category:', currentVisa.category, '), showing as Level 0');
        tiers.current = [visaId];
      } else {
        console.warn('[VisaMapRedesigned] Current visa category not eligible or not found, showing START instead');
        console.warn('[VisaMapRedesigned] Available visa IDs in knowledge base:', Object.keys(VISA_KNOWLEDGE_BASE).join(', '));
        tiers.current = ['start'];
      }
    } else {
      // User has no visa: show START node
      console.info('[VisaMapRedesigned] No currentVisa set, showing START node at Level 0');
      tiers.current = ['start'];
    }

    // Levels 1-3: Other visas organized by tier from knowledge base
    // FILTER: Only include work/long-term categories, skip tourist
    Object.keys(VISA_KNOWLEDGE_BASE).forEach((visaId) => {
      const visa = VISA_KNOWLEDGE_BASE[visaId];

      // SKIP if not in included categories (e.g., skip B-2 tourist)
      if (!INCLUDED_CATEGORIES.includes(visa.category)) {
        return;
      }

      // Skip if this is the current visa (already at Level 0)
      // IMPORTANT: currentVisa is already in knowledge base format, direct comparison
      if (visaId === userProfile.currentVisa) {
        console.info('[VisaMapRedesigned] Skipping visa', visaId, '(already showing at Level 0 as current visa)');
        return;
      }

      // Skip START node (handled separately above)
      if (visaId === 'start') {
        return;
      }

      // Organize by tier
      const tier = visa.tier;
      if (tier === 'entry' && !tiers.entry.includes(visaId)) {
        tiers.entry.push(visaId);
      } else if (tier === 'intermediate' && !tiers.intermediate.includes(visaId)) {
        tiers.intermediate.push(visaId);
      } else if (tier === 'advanced' && !tiers.advanced.includes(visaId)) {
        tiers.advanced.push(visaId);
      }
    });

    console.info('[VisaMapRedesigned] Final tier structure:', tiers);
    return tiers;
  }, [userProfile.currentVisa]);

  // ========================================================================
  // TIER ORDERING & POSITIONING
  // ========================================================================
  // MAP POSITIONING LOGIC:
  // X-axis (horizontal):
  // - Uses tier ordering: current → entry → intermediate → advanced
  // - Reflects progression time: short-term visas left, long-term right
  // - timeHorizon field from knowledge base could further refine spacing
  //
  // Y-axis (vertical):
  // - Uses difficulty field to position harder visas higher
  // - Centers visas within their tier based on difficulty
  // - Creates visual hierarchy: easier paths lower, harder paths higher
  //
  // Node size/styling:
  // - requiredEligibilityScore influences visual weight
  // - Status colors (green/blue/gray) show eligibility
  
  const tierOrder = ['current', 'entry', 'intermediate', 'advanced'];

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
  // RENDER CONNECTIONS (LINES) BETWEEN TIERS
  // ========================================================================
  const renderConnections = () => {
    const lines: React.ReactNode[] = [];
    let lineId = 0;

    for (let i = 0; i < tierOrder.length - 1; i++) {
      const currentTier = tierOrder[i];
      const nextTier = tierOrder[i + 1];
      const currentVisas = visasByTier[currentTier] || [];
      const nextVisas = visasByTier[nextTier] || [];

      currentVisas.forEach((_, currentIdx) => {
        nextVisas.forEach((nextVisaId, nextIdx) => {
          const currentPos = getVisaPosition(currentTier, currentIdx, currentVisas.length);
          const nextPos = getVisaPosition(nextTier, nextIdx, nextVisas.length);
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
    }

    return lines;
  };

  // ========================================================================
  // RENDER VISA NODES
  // ========================================================================
  const renderVisaNodes = () => {
    const nodes: React.ReactNode[] = [];

    tierOrder.forEach((tier) => {
      const visaIds = visasByTier[tier] || [];
      const isCurrentTier = tier === 'current';

      visaIds.forEach((visaId, index) => {
        const visa = VISA_KNOWLEDGE_BASE[visaId];
        const status = visaRecommendations[visaId]?.status || 'locked';
        const isSelected = selectedVisa === visaId;
        const isCurrentVisa = isCurrentTier && userProfile.currentVisa;

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
            onClick={() => onVisaSelect(visaId)}
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

      {/* Tier Labels */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center px-4 text-xs text-slate-400 font-semibold pointer-events-none">
        <div style={{ marginLeft: '80px' }}>Current</div>
        <div style={{ marginLeft: '200px' }}>Entry Level</div>
        <div style={{ marginLeft: '200px' }}>Intermediate</div>
        <div style={{ marginLeft: '200px' }}>Advanced</div>
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
