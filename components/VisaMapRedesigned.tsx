'use client';

import React, { useMemo } from 'react';
import { visaPaths } from '@/lib/mapData';
import { SkillLevels } from './SkillTreeEditable';

interface VisaMapRedesignedProps {
  skills: SkillLevels;
  selectedVisa?: string | null;
  onVisaSelect: (visaCode: string) => void;
}

const VisaMapRedesigned: React.FC<VisaMapRedesignedProps> = ({
  skills,
  selectedVisa,
  onVisaSelect,
}) => {
  // Determine visa eligibility based on skills
  const visaStatuses = useMemo(() => {
    const statuses: Record<string, 'recommended' | 'available' | 'locked'> = {};
    
    // Map string skills to numeric levels for comparison
    const educationLevel = typeof skills.education === 'string' 
      ? (skills.education === 'highschool' ? 1 : skills.education === 'bachelors' ? 2 : 3)
      : skills.education;
    
    const fieldLevel = typeof skills.fieldOfWork === 'string' ? 2 : skills.fieldOfWork;
    const citizenshipLevel = typeof skills.citizenship === 'string'
      ? (skills.citizenship === 'restricted' ? 1 : 2)
      : skills.citizenship;
    
    visaPaths.forEach((visa) => {
      if (visa.id === 'start') {
        statuses[visa.id] = 'recommended';
        return;
      }

      // Check if requirements are met
      let passesRequirements = true;
      
      if (visa.requirements.education && visa.requirements.education.min > educationLevel) {
        passesRequirements = false;
      }
      if (visa.requirements.workExperience && visa.requirements.workExperience.min > (skills.workExperience || 0)) {
        passesRequirements = false;
      }
      if (visa.requirements.fieldOfWork && visa.requirements.fieldOfWork.min > fieldLevel) {
        passesRequirements = false;
      }
      if (visa.requirements.citizenship && visa.requirements.citizenship.min > citizenshipLevel) {
        passesRequirements = false;
      }
      if (visa.requirements.language && visa.requirements.language.min > (skills.englishProficiency || 0)) {
        passesRequirements = false;
      }

      if (passesRequirements) {
        statuses[visa.id] = 'recommended';
      } else if (visa.tier === 'entry') {
        statuses[visa.id] = 'available'; // Entry visas usually available as stepping stones
      } else {
        statuses[visa.id] = 'locked';
      }
    });

    return statuses;
  }, [skills]);

  // Organize visas by tier
  const visasByTier = useMemo(() => {
    const tiers: Record<string, Array<(typeof visaPaths)[0]>> = {
      start: [],
      entry: [],
      intermediate: [],
      advanced: [],
    };

    visaPaths.forEach((visa) => {
      const tier = visa.tier || 'intermediate';
      if (!tiers[tier]) tiers[tier] = [];
      tiers[tier].push(visa);
    });

    return tiers;
  }, []);

  // Calculate positions for hierarchical layout
  const tierOrder = ['start', 'entry', 'intermediate', 'advanced'];
  
  const getVisaPosition = (tier: string, index: number, total: number) => {
    const tierIdx = tierOrder.indexOf(tier);
    const tierX = 80 + tierIdx * 220; // Horizontal spacing
    const tierY = 160 + (index - (total - 1) / 2) * 100; // Vertical centering
    return { x: tierX, y: tierY };
  };

  // Get line style based on status
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

  // Render lines connecting visas
  const renderConnections = () => {
    const lines: React.ReactNode[] = [];
    let lineId = 0;

    tierOrder.forEach((tier, tierIdx) => {
      if (tierIdx >= tierOrder.length - 1) return;
      
      const nextTier = tierOrder[tierIdx + 1];
      const currentTierVisas = visasByTier[tier] || [];
      const nextTierVisas = visasByTier[nextTier] || [];

      currentTierVisas.forEach((_, currentIdx) => {
        nextTierVisas.forEach((nextVisa, nextIdx) => {
          const currentPos = getVisaPosition(tier, currentIdx, currentTierVisas.length);
          const nextPos = getVisaPosition(nextTier, nextIdx, nextTierVisas.length);
          const nextStatus = visaStatuses[nextVisa.id];
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

  return (
    <div className="relative w-full h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden">
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur rounded-lg p-3 text-xs z-40 border border-slate-700">
        <div className="font-semibold mb-2 text-slate-200">Visa Status</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-slate-300">Recommended</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-300">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-slate-300">Locked</span>
          </div>
        </div>
      </div>

      {/* Tier Labels */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center px-4 text-xs text-slate-400 font-semibold pointer-events-none">
        <div style={{ marginLeft: '80px' }}>Start</div>
        <div style={{ marginLeft: '200px' }}>Entry Level</div>
        <div style={{ marginLeft: '200px' }}>Intermediate</div>
        <div style={{ marginLeft: '200px' }}>Advanced</div>
      </div>

      {/* SVG Canvas for Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        {renderConnections()}
      </svg>

      {/* Visa Nodes */}
      <div className="relative w-full h-full pt-16">
        {tierOrder.map((tier) =>
          (visasByTier[tier] || []).map((visa, index) => {
            const pos = getVisaPosition(tier, index, (visasByTier[tier] || []).length);
            const isSelected = selectedVisa === visa.id;
            const status = visaStatuses[visa.id];

            return (
              <button
                key={visa.id}
                onClick={() => onVisaSelect(visa.id)}
                className={`absolute w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold text-center transition-all duration-200 cursor-pointer group ${
                  isSelected
                    ? 'ring-2 ring-yellow-400 scale-110 z-30'
                    : 'hover:scale-105 z-10'
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
              >
                <div className="text-2xl">{visa.emoji}</div>
                <div className="text-xs font-semibold leading-tight">{visa.id.toUpperCase()}</div>

                {/* Hover Card */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 border border-slate-700">
                  {visa.name}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VisaMapRedesigned;
