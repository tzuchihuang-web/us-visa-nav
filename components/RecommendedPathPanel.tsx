/**
 * RECOMMENDED PATH PANEL
 * 
 * 顯示在地圖下方的推薦路徑面板
 * - 當 user 完成 onboarding 或更新 profile 後自動計算並顯示
 * - 顯示最佳的 2-3 步簽證路徑
 * - 點擊路徑中的簽證會 highlight 在地圖上
 */

'use client';

import React from 'react';
import { RecommendedPath, PathStep } from '@/lib/path-recommendation';

interface RecommendedPathPanelProps {
  path: RecommendedPath | null;
  onVisaSelect?: (visaId: string) => void;
  onClose?: () => void;
  className?: string;
}

export function RecommendedPathPanel({
  path,
  onVisaSelect,
  onClose,
  className = '',
}: RecommendedPathPanelProps) {
  if (!path) {
    return null;
  }

  const confidenceConfig = {
    high: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      badge: 'bg-green-100 text-green-700',
      text: 'High Match',
    },
    medium: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-700',
      text: 'Good Match',
    },
    low: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-700',
      text: 'Consider Options',
    },
  };

  const config = confidenceConfig[path.confidence];

  const handleStepClick = (visaId: string) => {
    if (onVisaSelect) {
      onVisaSelect(visaId);
    }
  };

  return (
    <div 
      className={`absolute bottom-0 left-0 right-0 glass-panel border-t-2 ${config.border} p-6 ${className} shadow-2xl`}
      style={{
        maxHeight: '40vh',
        overflowY: 'auto',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-black text-black">
              RECOMMENDED PATH FOR YOU
            </h3>
            <span className={`px-4 py-1.5 rounded-full text-xs ${config.badge}`}>
              {config.text}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-black font-black">
              ESTIMATED: {Math.ceil(path.totalEstimatedMonths / 12)} YEARS
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-black text-3xl leading-none font-light transition-colors"
                aria-label="Close recommended path panel"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-5 font-semibold">{path.description}</p>

        {/* Path Steps */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {path.steps.map((step, index) => (
            <React.Fragment key={step.visaId}>
              {/* Step Card */}
              <button
                onClick={() => handleStepClick(step.visaId)}
                className={`
                  flex-shrink-0 p-5 glass-panel rounded-2xl border-2 transition-all
                  hover:shadow-lg hover:scale-105 cursor-pointer
                  ${
                    step.score.status === 'recommended'
                      ? 'border-green-300 hover:border-green-400'
                      : step.score.status === 'available'
                      ? 'border-blue-300 hover:border-blue-400'
                      : 'border-gray-300 hover:border-gray-400'
                  }
                `}
                style={{ minWidth: '220px' }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 text-left">
                    {/* Step Number */}
                    <div className="text-xs font-black text-gray-500 mb-2 tracking-wider">
                      STEP {index + 1}
                    </div>

                    {/* Visa Name */}
                    <div className="font-black text-black mb-1 text-base">
                      {step.visa.name}
                    </div>

                    {/* Visa Code */}
                    <div className="text-xs text-gray-600 mb-3 font-semibold">
                      {step.visa.code}
                    </div>

                    {/* Match Percentage */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            step.score.matchPercentage >= 90
                              ? 'bg-green-500'
                              : step.score.matchPercentage >= 70
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${step.score.matchPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {step.score.matchPercentage}%
                      </span>
                    </div>

                    {/* Estimated Time */}
                    {step.estimatedTimeMonths && (
                      <div className="text-xs text-gray-500 mt-2">
                        ⏱️ ~{step.estimatedTimeMonths} months
                      </div>
                    )}
                  </div>
                </div>
              </button>

              {/* Arrow between steps */}
              {index < path.steps.length - 1 && (
                <div className="flex-shrink-0 text-2xl text-gray-400">→</div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-3 flex items-start gap-2 text-xs text-gray-600">
          <span>💡</span>
          <p>
            Click on any step to see detailed requirements. This is a suggested path based on your
            profile and typical immigration patterns. Individual results may vary.
          </p>
        </div>
      </div>
    </div>
  );
}
