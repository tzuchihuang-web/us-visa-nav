/**
 * LEGAL DISCLAIMER COMPONENT
 * 
 * Persistent footer warning displayed on all pages with visa guidance.
 * Makes clear that this is not legal advice and users should consult immigration attorney.
 */

'use client';

export function LegalDisclaimer() {
  return (
    <div className="w-full bg-yellow-50 border-t border-yellow-200 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-3 items-start">
          <div className="text-yellow-700 text-lg font-bold flex-shrink-0">⚠️</div>
          <div className="text-sm text-yellow-900">
            <p className="font-semibold mb-1">Legal Disclaimer</p>
            <p>
              This tool provides{' '}
              <strong>
                general information based on publicly available sources and is not legal advice
              </strong>
              .
              Visa eligibility rules change frequently and vary by individual circumstances. For personalized legal
              guidance on your specific situation,{' '}
              <strong>consult a licensed immigration attorney</strong>. See{' '}
              <a
                href="https://www.uscis.gov/i-864"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold hover:text-yellow-800"
              >
                USCIS.gov
              </a>{' '}
              for official information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
