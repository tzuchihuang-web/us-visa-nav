/**
 * useOnboarding Hook
 * 
 * Manages onboarding state and logic.
 * Tracks user progress through the questionnaire steps.
 * 
 * WHERE TO CUSTOMIZE:
 * - Add new onboarding questions → update OnboardingData type in /lib/types/onboarding.ts
 * - Change step validation logic → modify validateStep() function
 * - Adjust skill tree scoring → see mapOnboardingToSkillTree() function
 */

'use client';

import { useState } from 'react';
import {
  OnboardingData,
  EducationLevel,
  VisaStatusOption,
  CurrentVisaType,
  ImmigrationGoal,
} from '@/lib/types/onboarding';

export const useOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({
    completedStep: 0,
  });

  // STEP 0: Current visa status
  const setVisaStatus = (status: VisaStatusOption) => {
    setOnboardingData((prev) => ({
      ...prev,
      currentVisaStatus: status,
    }));
    setCurrentStep(1);
  };

  // STEP 1: Current visa type (if has visa) OR immigration goal (if no visa)
  const setCurrentVisa = (visa: CurrentVisaType) => {
    setOnboardingData((prev) => ({
      ...prev,
      currentVisa: visa,
    }));
    setCurrentStep(2);
  };

  const setImmigrationGoal = (goal: ImmigrationGoal) => {
    setOnboardingData((prev) => ({
      ...prev,
      immigrationGoal: goal,
    }));
    setCurrentStep(2);
  };

  // STEP 2: Education level
  const setEducationLevel = (level: EducationLevel) => {
    setOnboardingData((prev) => ({
      ...prev,
      educationLevel: level,
    }));
    setCurrentStep(3);
  };

  // STEP 3: Years of experience (just update, don't auto-advance)
  const setYearsOfExperience = (years: number) => {
    setOnboardingData((prev) => ({
      ...prev,
      yearsOfExperience: years,
    }));
    // Don't auto-advance - user must click Next/Complete button
  };

  // Complete onboarding (called when user clicks Complete button)
  const completeOnboarding = () => {
    setOnboardingData((prev) => ({
      ...prev,
      completedAt: new Date().toISOString(),
      completedStep: 3,
    }));
    setCurrentStep(4); // Trigger completion and redirect
  };

  // Go to a specific step (for Next button)
  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Go back to previous step
  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Skip onboarding (uses default values)
  const skipOnboarding = () => {
    setOnboardingData((prev) => ({
      ...prev,
      currentVisaStatus: 'no_visa',
      immigrationGoal: 'work',
      educationLevel: 'bachelors',
      yearsOfExperience: 2,
      completedAt: new Date().toISOString(),
      completedStep: 3,
    }));
    setCurrentStep(4);
  };

  // Check if current step is valid
  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 0:
        return !!onboardingData.currentVisaStatus;
      case 1:
        return onboardingData.currentVisaStatus === 'has_visa'
          ? !!onboardingData.currentVisa
          : !!onboardingData.immigrationGoal;
      case 2:
        return !!onboardingData.educationLevel;
      case 3:
        return onboardingData.yearsOfExperience !== undefined;
      default:
        return false;
    }
  };

  return {
    currentStep,
    onboardingData: onboardingData as OnboardingData,
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
    isCompleted: currentStep === 4,
  };
};
