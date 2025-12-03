'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import { saveOnboardingData } from '@/lib/supabase/client';
import { ONBOARDING_OPTIONS } from '@/lib/types/onboarding';
import { Button } from '@/components/ui/button';
import styles from './onboarding.module.css';

/**
 * Onboarding Page
 * 
 * First-time user questionnaire flow.
 * Users must complete this before accessing the main app.
 * 
 * FLOW:
 * Step 0: "Do you currently have a U.S. visa?"
 * Step 1: "Which visa?" or "What's your goal?" (depends on step 0)
 * Step 2: "What's your education level?"
 * Step 3: "Years of work experience?"
 * → Completion: Redirect to home page
 * 
 * WHERE TO CUSTOMIZE:
 * - Question wording → Update text in step renderers
 * - Add new questions → Add new step case to switch statement
 * - Styling → Modify className props
 */

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    currentStep,
    onboardingData,
    setVisaStatus,
    setCurrentVisa,
    setImmigrationGoal,
    setEducationLevel,
    setYearsOfExperience,
    goToStep,
    goBack,
    skipOnboarding,
    completeOnboarding,
    isStepValid,
    isCompleted,
  } = useOnboarding();

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  // Redirect after completion
  useEffect(() => {
    if (isCompleted) {
      // Save onboardingData to Supabase
      if (user) {
        saveOnboardingData(user.id, onboardingData);
        // Also keep in localStorage as backup
        localStorage.setItem(
          `onboarding_${user.id}`,
          JSON.stringify(onboardingData)
        );
      }
      // Redirect to home after a short delay to ensure data is saved
      setTimeout(() => {
        router.push('/');
      }, 500);
    }
  }, [isCompleted, user, onboardingData, router]);

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.spinner}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header with progress */}
        <div className={styles.header}>
          <h1 className={styles.title}>🦅 Welcome to US Visa Navigator</h1>
          <p className={styles.subtitle}>
            Let's learn about your visa journey in just a few questions
          </p>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${((currentStep + 1) / 4) * 100}%` }}
            />
          </div>
          <p className={styles.progressText}>
            Step {currentStep + 1} of 4
          </p>
        </div>

        {/* Question Content */}
        <div className={styles.content}>
          {/* STEP 0: Current Visa Status */}
          {currentStep === 0 && (
            <div className={styles.questionBlock}>
              <h2 className={styles.questionTitle}>
                Do you currently hold a U.S. visa?
              </h2>
              <p className={styles.questionDescription}>
                This helps us tailor your visa journey and show relevant opportunities.
              </p>
              <div className={styles.optionsGrid}>
                {ONBOARDING_OPTIONS.visaStatus.map((option) => (
                  <button
                    key={option.value}
                    className={`${styles.optionButton} ${
                      onboardingData.currentVisaStatus === option.value
                        ? styles.optionButtonActive
                        : ''
                    }`}
                    onClick={() => setVisaStatus(option.value)}
                  >
                    <span className={styles.optionLabel}>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1a: Current Visa Type (if has visa) */}
          {currentStep === 1 && onboardingData.currentVisaStatus === 'has_visa' && (
            <div className={styles.questionBlock}>
              <h2 className={styles.questionTitle}>
                Which U.S. visa do you currently hold?
              </h2>
              <p className={styles.questionDescription}>
                Select the visa type that matches your current status.
              </p>
              <div className={styles.optionsGrid}>
                {ONBOARDING_OPTIONS.currentVisa.map((option) => (
                  <button
                    key={option.value}
                    className={`${styles.optionButton} ${
                      onboardingData.currentVisa === option.value
                        ? styles.optionButtonActive
                        : ''
                    }`}
                    onClick={() => setCurrentVisa(option.value)}
                  >
                    <span className={styles.optionLabel}>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1b: Immigration Goal (if no visa) */}
          {currentStep === 1 && onboardingData.currentVisaStatus === 'no_visa' && (
            <div className={styles.questionBlock}>
              <h2 className={styles.questionTitle}>
                What is your main goal for coming to the U.S.?
              </h2>
              <p className={styles.questionDescription}>
                This helps us recommend the best visa options for you.
              </p>
              <div className={styles.optionsGrid}>
                {ONBOARDING_OPTIONS.immigrationGoal.map((option) => (
                  <button
                    key={option.value}
                    className={`${styles.optionButton} ${
                      onboardingData.immigrationGoal === option.value
                        ? styles.optionButtonActive
                        : ''
                    }`}
                    onClick={() => setImmigrationGoal(option.value)}
                  >
                    <span className={styles.optionLabel}>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Education Level */}
          {currentStep === 2 && (
            <div className={styles.questionBlock}>
              <h2 className={styles.questionTitle}>
                What is your highest level of education?
              </h2>
              <p className={styles.questionDescription}>
                This affects your eligibility for certain visa categories.
              </p>
              <div className={styles.optionsGrid}>
                {ONBOARDING_OPTIONS.educationLevel.map((option) => (
                  <button
                    key={option.value}
                    className={`${styles.optionButton} ${
                      onboardingData.educationLevel === option.value
                        ? styles.optionButtonActive
                        : ''
                    }`}
                    onClick={() => setEducationLevel(option.value)}
                  >
                    <span className={styles.optionLabel}>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Years of Experience */}
          {currentStep === 3 && (
            <div className={styles.questionBlock}>
              <h2 className={styles.questionTitle}>
                How many years of professional work experience do you have?
              </h2>
              <p className={styles.questionDescription}>
                This is relevant for employment-based visas like H-1B and EB categories.
              </p>
              <div className={styles.experienceSlider}>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={onboardingData.yearsOfExperience || 0}
                  onChange={(e) =>
                    setYearsOfExperience(parseInt(e.target.value))
                  }
                  className={styles.slider}
                />
                <div className={styles.experienceDisplay}>
                  <span className={styles.experienceValue}>
                    {onboardingData.yearsOfExperience || 0}
                  </span>
                  <span className={styles.experienceLabel}>years</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className={styles.footer}>
          <button
            className={styles.skipButton}
            onClick={skipOnboarding}
          >
            Skip for now
          </button>

          <div className={styles.buttonGroup}>
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={goBack}
                className={styles.backButton}
              >
                Back
              </Button>
            )}
            <Button
              onClick={() => {
                if (currentStep === 3) {
                  // On last step, complete the onboarding
                  completeOnboarding();
                } else {
                  // On other steps, advance to next
                  goToStep(currentStep + 1);
                }
              }}
              disabled={!isStepValid()}
              className={styles.nextButton}
            >
              {currentStep === 3 ? 'Complete' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
