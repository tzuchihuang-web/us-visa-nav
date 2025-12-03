/**
 * Visa Detail Panel Component
 * 
 * PHASE 4: Right-side fixed panel for visa details
 * - Fixed position on right side of screen (outside map canvas)
 * - Opens when user clicks a visa node
 * - Closes when clicking outside or X button
 * - Shows visa info, requirements, user match status
 */

'use client';

interface VisaRequirements {
  education?: string;
  experience?: string;
  salary?: string;
  sponsorship?: string;
}

interface VisaDetailPanelProps {
  isOpen: boolean;
  visa: {
    id: string;
    name: string;
    emoji: string;
    description: string;
    fullDescription?: string;
    category: string;
    status: 'recommended' | 'available' | 'locked';
    requirements?: VisaRequirements;
  } | null;
  userMeets?: {
    education?: boolean;
    experience?: boolean;
    salary?: boolean;
    sponsorship?: boolean;
  };
  onClose: () => void;
  onExplore?: () => void;
}

export function VisaDetailPanel({
  isOpen,
  visa,
  userMeets = {},
  onClose,
  onExplore,
}: VisaDetailPanelProps) {
  if (!isOpen || !visa) return null;

  const statusConfig = {
    recommended: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      badge: 'bg-green-100 text-green-800',
      text: '⭐ May Be Eligible',
    },
    available: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-800',
      text: '✓ Could Be a Path',
    },
    locked: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      badge: 'bg-gray-100 text-gray-800',
      text: '🔒 Strengthen Skills First',
    },
  };

  const config = statusConfig[visa.status];

  return (
    <>
      {/* Backdrop - Click to close */}
      <div
        className="fixed inset-0 z-40 bg-black/0 pointer-events-auto"
        onClick={onClose}
        style={{ right: '360px' }}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-screen w-96 z-50 bg-white border-l shadow-xl overflow-y-auto ${config.border}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${config.bg} border-b ${config.border} p-6 sticky top-0`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{visa.emoji}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{visa.name}</h2>
                <p className="text-sm text-gray-600">{visa.category}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              aria-label="Close panel"
            >
              ×
            </button>
          </div>

          {/* Status Badge */}
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.badge}`}>
            {config.text}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {visa.fullDescription && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Overview</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {visa.fullDescription}
              </p>
            </div>
          )}

          {/* Requirements */}
          {visa.requirements && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
              <div className="space-y-2">
                {visa.requirements.education && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">{userMeets.education ? '✓' : '○'}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Education</p>
                      <p className="text-xs text-gray-600">{visa.requirements.education}</p>
                      {userMeets.education && (
                        <p className="text-xs text-green-600 mt-1">You meet this</p>
                      )}
                    </div>
                  </div>
                )}

                {visa.requirements.experience && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">{userMeets.experience ? '✓' : '○'}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Experience</p>
                      <p className="text-xs text-gray-600">{visa.requirements.experience}</p>
                      {userMeets.experience && (
                        <p className="text-xs text-green-600 mt-1">You meet this</p>
                      )}
                    </div>
                  </div>
                )}

                {visa.requirements.salary && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">{userMeets.salary ? '✓' : '○'}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Salary</p>
                      <p className="text-xs text-gray-600">{visa.requirements.salary}</p>
                      {userMeets.salary && (
                        <p className="text-xs text-green-600 mt-1">You meet this</p>
                      )}
                    </div>
                  </div>
                )}

                {visa.requirements.sponsorship && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">{userMeets.sponsorship ? '✓' : '○'}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Sponsorship</p>
                      <p className="text-xs text-gray-600">{visa.requirements.sponsorship}</p>
                      {userMeets.sponsorship && (
                        <p className="text-xs text-green-600 mt-1">You meet this</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Match Summary */}
          {visa.status === 'locked' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>Requirements not met:</strong> Strengthen your qualifications to explore this path.
              </p>
            </div>
          )}

          {visa.status === 'recommended' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900">
                <strong>May be eligible:</strong> This visa aligns with your profile and could be a good next step.
              </p>
            </div>
          )}

          {visa.status === 'available' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Could be a path:</strong> This visa could work for your situation with some qualification strengthening.
              </p>
            </div>
          )}
        </div>

        {/* CTA Button - Sticky footer */}
        <div className="sticky bottom-0 p-6 bg-white border-t border-gray-200">
          <button
            onClick={onExplore}
            className={`w-full font-medium py-2 px-4 rounded-lg transition-colors ${
              visa.status === 'locked'
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            disabled={visa.status === 'locked'}
          >
            {visa.status === 'locked' ? 'Improve Skills to Unlock' : 'Explore Path'}
          </button>
        </div>
      </div>
    </>
  );
}
