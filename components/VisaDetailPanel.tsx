/**
 * Visa Detail Panel Component
 * 
 * REDESIGNED: Bottom expandable panel for visa details
 * - Opens below the map when user clicks a visa node
 * - Doesn't block the map view
 * - Two modes: compact (requirements only) and expanded (full details)
 * - Shows visa info, requirements, timeline, documents, and process steps
 */

'use client';

import { useState } from 'react';
import { VISA_KNOWLEDGE_BASE as LIB_VISA_KB } from '@/lib/visa-knowledge-base';
import { VISA_KNOWLEDGE_BASE as SRC_VISA_KB } from '@/src/data/visaKnowledgeBase';

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
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!isOpen || !visa) return null;

  // Get full visa data from both knowledge bases for expanded view
  const libVisaData = visa.id ? LIB_VISA_KB[visa.id.toUpperCase()] : null;
  const srcVisaData = visa.id ? SRC_VISA_KB.find(v => v.id.toUpperCase() === visa.id.toUpperCase()) : null;

  const statusConfig = {
    recommended: {
      bg: 'glass-panel',
      border: 'border-green-200',
      badge: 'bg-green-100 text-green-800 font-black',
      text: 'MAY BE ELIGIBLE',
    },
    available: {
      bg: 'glass-panel',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-800 font-black',
      text: 'COULD BE A PATH',
    },
    locked: {
      bg: 'glass-panel',
      border: 'border-gray-200',
      badge: 'bg-gray-100 text-gray-800 font-black',
      text: 'STRENGTHEN SKILLS FIRST',
    },
  };

  const config = statusConfig[visa.status];

  const handleExplorePath = () => {
    setIsExpanded(true);
    if (onExplore) {
      onExplore();
    }
  };

  return (
    <>
      {/* Bottom Panel - Inside Map area */}
      <div
        className={`absolute bottom-4 left-4 right-4 z-50 glass-panel border-t-2 shadow-2xl transition-all duration-300 ${
          config.border
        } ${isExpanded ? 'h-[65vh]' : 'h-auto max-h-[35vh]'} overflow-hidden`}
      >
        {/* Panel Content */}
        <div className="h-full flex flex-col">
          {/* Header - Always visible */}
          <div className={`${config.bg} border-b ${config.border} p-4 flex-shrink-0`}>
            <div className="max-w-7xl mx-auto">
                  <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-xl font-black text-black">{visa.name}</h2>
                    <p className="text-xs text-gray-600 mt-1 font-semibold uppercase">{visa.category}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-3xl leading-none font-light"
                  aria-label="Close panel"
                >
                  ×
                </button>
              </div>

              {/* Status Badge & Meta Info */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className={`px-3 py-1 rounded-full text-xs ${config.badge}`}>
                  {config.text}
                </div>

                {visa.timeHorizon && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-gray-900 font-bold">TIME:</span>
                    <span className="text-gray-700 font-semibold">
                      {visa.timeHorizon === 'short' && '6mo-1yr'}
                      {visa.timeHorizon === 'medium' && '1-3yr'}
                      {visa.timeHorizon === 'long' && '3+ yr'}
                    </span>
                  </div>
                )}

                {visa.difficulty && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-gray-900 font-bold">DIFFICULTY:</span>
                    <span className="text-gray-700 font-semibold">
                      {visa.difficulty === 1 && 'Easy'}
                      {visa.difficulty === 2 && 'Moderate'}
                      {visa.difficulty === 3 && 'Difficult'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: isExpanded ? 'calc(65vh - 160px)' : 'calc(35vh - 160px)' }}>
            <div className="max-w-7xl mx-auto p-3 space-y-3">
              {/* Description */}
              {visa.fullDescription && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-1.5 text-sm">Overview</h3>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {visa.fullDescription}
                  </p>
                </div>
              )}

              {/* Requirements */}
              {visa.requirements && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-1.5 text-sm">Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {visa.requirements.education && (
                  <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
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
                  <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
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
                  <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
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
                  <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
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
                  <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
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
                  <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
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
                  <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
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
                  <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
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

              {/* Match Summary */}
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

              {/* Expanded Details - Show when Explore Path clicked */}
              {isExpanded && srcVisaData && (
                <>
                  {/* Eligibility Criteria */}
                  {srcVisaData.eligibilityCriteria && srcVisaData.eligibilityCriteria.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Eligibility Criteria</h3>
                      <div className="space-y-2">
                        {srcVisaData.eligibilityCriteria.map((criterion, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <span className="text-green-600 mt-0.5">✓</span>
                            <p className="text-sm text-gray-700 flex-1">{criterion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required Documents */}
                  {srcVisaData.requiredDocuments && srcVisaData.requiredDocuments.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Required Documents</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {srcVisaData.requiredDocuments.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg"
                          >
                            <span className="text-blue-600">📄</span>
                            <p className="text-sm text-gray-700 flex-1">{doc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Process Steps */}
                  {srcVisaData.typicalProcessSteps && srcVisaData.typicalProcessSteps.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Typical Application Process</h3>
                      <div className="space-y-2">
                        {srcVisaData.typicalProcessSteps.map((step, index) => (
                            <div
                              key={index}
                              className="flex gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                            >
                              <div className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-700">{step}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Official Links */}
                  {srcVisaData.officialLinks && srcVisaData.officialLinks.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Official Resources</h3>
                      <div className="space-y-1">
                        {srcVisaData.officialLinks.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                          >
                            <span className="text-blue-600">🔗</span>
                            <span className="text-xs font-medium text-blue-600 hover:underline">
                              {link.label}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Action Footer - Sticky */}
          <div className="flex-shrink-0 p-3 glass-panel border-t border-gray-100 shadow-lg">
            <div className="max-w-7xl mx-auto flex gap-2">
              {!isExpanded ? (
                <button
                  onClick={handleExplorePath}
                  className={`flex-1 font-black py-2 px-3 rounded-lg transition-all text-xs ${
                    visa.status === 'locked'
                      ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                      : 'bg-black hover:bg-gray-800 text-white'
                  }`}
                  disabled={visa.status === 'locked'}
                >
                  {visa.status === 'locked' ? 'IMPROVE SKILLS TO UNLOCK' : 'EXPLORE FULL DETAILS →'}
                </button>
              ) : (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="flex-1 font-black py-2 px-3 rounded-lg transition-all text-xs glass-button"
                >
                  ← SHOW LESS
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
