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
  english?: string;
  investment?: string;
  citizenship?: string;
  previousVisa?: string;
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
    timeHorizon?: 'short' | 'medium' | 'long';
    difficulty?: 1 | 2 | 3;
  } | null;
  userMeets?: {
    education?: boolean;
    experience?: boolean;
    english?: boolean;
    investment?: boolean;
    citizenship?: boolean;
    previousVisa?: boolean;
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

          {/* Meta Info: Time Horizon & Difficulty */}
          {(visa.timeHorizon || visa.difficulty) && (
            <div className="flex gap-4 mt-3 text-xs">
              {visa.timeHorizon && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">⏱️</span>
                  <span className="text-gray-700 font-medium">
                    {visa.timeHorizon === 'short' && 'Short-term (6mo-1yr)'}
                    {visa.timeHorizon === 'medium' && 'Medium-term (1-3yr)'}
                    {visa.timeHorizon === 'long' && 'Long-term (3+ yr)'}
                  </span>
                </div>
              )}
              {visa.difficulty && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">📊</span>
                  <span className="text-gray-700 font-medium">
                    {visa.difficulty === 1 && 'Easy'}
                    {visa.difficulty === 2 && 'Moderate'}
                    {visa.difficulty === 3 && 'Difficult'}
                  </span>
                </div>
              )}
            </div>
          )}
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
                    <div className="mt-1">
                      {userMeets.education === true ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : userMeets.education === false ? (
                        <span className="text-red-500 font-bold">✗</span>
                      ) : (
                        <span className="text-gray-400">○</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Education</p>
                      <p className="text-xs text-gray-600">{visa.requirements.education}</p>
                      {userMeets.education === true && (
                        <p className="text-xs text-green-600 mt-1 font-medium">✓ You meet this requirement</p>
                      )}
                      {userMeets.education === false && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">Need to strengthen this area</p>
                      )}
                    </div>
                  </div>
                )}

                {visa.requirements.experience && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">
                      {userMeets.experience === true ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : userMeets.experience === false ? (
                        <span className="text-red-500 font-bold">✗</span>
                      ) : (
                        <span className="text-gray-400">○</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Experience</p>
                      <p className="text-xs text-gray-600">{visa.requirements.experience}</p>
                      {userMeets.experience === true && (
                        <p className="text-xs text-green-600 mt-1 font-medium">✓ You meet this requirement</p>
                      )}
                      {userMeets.experience === false && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">Need to strengthen this area</p>
                      )}
                    </div>
                  </div>
                )}

                {visa.requirements.english && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">
                      {userMeets.english === true ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : userMeets.english === false ? (
                        <span className="text-red-500 font-bold">✗</span>
                      ) : (
                        <span className="text-gray-400">○</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">English Proficiency</p>
                      <p className="text-xs text-gray-600">{visa.requirements.english}</p>
                      {userMeets.english === true && (
                        <p className="text-xs text-green-600 mt-1 font-medium">✓ You meet this requirement</p>
                      )}
                      {userMeets.english === false && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">Need to strengthen this area</p>
                      )}
                    </div>
                  </div>
                )}

                {visa.requirements.investment && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">
                      {userMeets.investment === true ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : userMeets.investment === false ? (
                        <span className="text-red-500 font-bold">✗</span>
                      ) : (
                        <span className="text-gray-400">○</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Investment Amount</p>
                      <p className="text-xs text-gray-600">{visa.requirements.investment}</p>
                      {userMeets.investment === true && (
                        <p className="text-xs text-green-600 mt-1 font-medium">✓ You meet this requirement</p>
                      )}
                      {userMeets.investment === false && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">Need to strengthen this area</p>
                      )}
                    </div>
                  </div>
                )}

                {visa.requirements.citizenship && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">
                      {userMeets.citizenship === true ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : userMeets.citizenship === false ? (
                        <span className="text-red-500 font-bold">✗</span>
                      ) : (
                        <span className="text-gray-400">○</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Citizenship Eligibility</p>
                      <p className="text-xs text-gray-600">{visa.requirements.citizenship}</p>
                      {userMeets.citizenship === true && (
                        <p className="text-xs text-green-600 mt-1 font-medium">✓ You meet this requirement</p>
                      )}
                      {userMeets.citizenship === false && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">Citizenship restrictions may apply</p>
                      )}
                    </div>
                  </div>
                )}

                {visa.requirements.previousVisa && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">
                      {userMeets.previousVisa === true ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : userMeets.previousVisa === false ? (
                        <span className="text-red-500 font-bold">✗</span>
                      ) : (
                        <span className="text-gray-400">○</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Previous Visa Required</p>
                      <p className="text-xs text-gray-600">{visa.requirements.previousVisa}</p>
                      {userMeets.previousVisa === true && (
                        <p className="text-xs text-green-600 mt-1 font-medium">✓ You meet this requirement</p>
                      )}
                      {userMeets.previousVisa === false && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">Previous visa requirement not met</p>
                      )}
                    </div>
                  </div>
                )}

                {visa.requirements.salary && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">
                      {userMeets.salary === true ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : userMeets.salary === false ? (
                        <span className="text-red-500 font-bold">✗</span>
                      ) : (
                        <span className="text-gray-400">○</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Salary</p>
                      <p className="text-xs text-gray-600">{visa.requirements.salary}</p>
                      {userMeets.salary === true && (
                        <p className="text-xs text-green-600 mt-1 font-medium">✓ You meet this requirement</p>
                      )}
                      {userMeets.salary === false && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">Need to strengthen this area</p>
                      )}
                    </div>
                  </div>
                )}

                {visa.requirements.sponsorship && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="mt-1">
                      {userMeets.sponsorship === true ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : userMeets.sponsorship === false ? (
                        <span className="text-red-500 font-bold">✗</span>
                      ) : (
                        <span className="text-gray-400">○</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Sponsorship</p>
                      <p className="text-xs text-gray-600">{visa.requirements.sponsorship}</p>
                      {userMeets.sponsorship === true && (
                        <p className="text-xs text-green-600 mt-1 font-medium">✓ You meet this requirement</p>
                      )}
                      {userMeets.sponsorship === false && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">Need to strengthen this area</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Match Summary - Shows overall eligibility */}
          <div className={`p-4 rounded-lg border ${
            visa.status === 'recommended' 
              ? 'bg-green-50 border-green-200' 
              : visa.status === 'available'
              ? 'bg-blue-50 border-blue-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className={`text-sm ${
              visa.status === 'recommended' 
                ? 'text-green-900' 
                : visa.status === 'available'
                ? 'text-blue-900'
                : 'text-amber-900'
            }`}>
              {visa.status === 'recommended' && (
                <>
                  <strong>✓ Core requirements met:</strong> Your profile strongly aligns with this visa. 
                  This could be an excellent path for you.
                </>
              )}
              {visa.status === 'available' && (
                <>
                  <strong>Partial match:</strong> You meet many requirements for this visa. 
                  Consider strengthening a few areas to increase your eligibility.
                </>
              )}
              {visa.status === 'locked' && (
                <>
                  <strong>Requirements not met:</strong> Strengthen your qualifications to explore this path. 
                  Focus on the requirements marked above.
                </>
              )}
            </div>
          </div>
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
