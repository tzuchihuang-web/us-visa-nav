/**
 * PATH RECOMMENDATION ENGINE
 * 
 * 根據 user profile 和 matching engine 結果，計算最佳的簽證路徑
 * - 從當前簽證開始，找出最有可能成功的下一步
 * - 考慮 matching score、時間長度、成功率
 */

import { VISA_KNOWLEDGE_BASE, VisaDefinition } from './visa-knowledge-base';
import { getVisaRecommendations, VisaEligibilityScore } from './visa-matching-engine';
import { UserProfile } from './types';

export interface PathStep {
  visaId: string;
  visa: VisaDefinition;
  score: VisaEligibilityScore;
  reason: string;
  estimatedTimeMonths?: number;
}

export interface RecommendedPath {
  steps: PathStep[];
  totalEstimatedMonths: number;
  description: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * 計算從當前簽證到目標的最佳路徑
 * 使用 BFS 算法找出 score 最高的路徑
 */
export function getRecommendedPath(profile: UserProfile): RecommendedPath | null {
  const currentVisaId = profile.currentVisa?.toLowerCase();
  const recommendations = getVisaRecommendations(profile);

  // 如果沒有當前簽證，推薦最佳的入門簽證
  if (!currentVisaId || currentVisaId === 'none') {
    return getEntryLevelRecommendation(recommendations);
  }

  // 從當前簽證找出最佳的下一步路徑
  const currentVisa = VISA_KNOWLEDGE_BASE[currentVisaId];
  if (!currentVisa) {
    console.warn('[PathRecommendation] Current visa not found:', currentVisaId);
    return null;
  }

  // 找出所有可能的下一步
  const nextSteps = currentVisa.commonNextSteps || [];
  
  if (nextSteps.length === 0) {
    // 當前簽證沒有常見的下一步（可能已是永久居留）
    return null;
  }

  // 評分並排序所有可能的下一步
  const scoredSteps = nextSteps
    .map(step => {
      const visaId = step.visaId.toLowerCase();
      const visa = VISA_KNOWLEDGE_BASE[visaId];
      const score = recommendations[visaId];
      
      if (!visa || !score) return null;

      return {
        visaId,
        visa,
        score,
        reason: step.reason,
        estimatedTimeMonths: getEstimatedTimeMonths(visa),
      } as PathStep;
    })
    .filter((step): step is PathStep => step !== null)
    .sort((a, b) => {
      // 優先推薦 'recommended' 狀態
      if (a.score.status === 'recommended' && b.score.status !== 'recommended') return -1;
      if (b.score.status === 'recommended' && a.score.status !== 'recommended') return 1;
      
      // 其次按照 match percentage 排序
      return b.score.matchPercentage - a.score.matchPercentage;
    });

  if (scoredSteps.length === 0) {
    return null;
  }

  // 選擇最佳的 2-3 個步驟組成路徑
  const pathSteps: PathStep[] = [];
  let totalMonths = 0;
  const currentStep = scoredSteps[0];
  
  pathSteps.push(currentStep);
  totalMonths += currentStep.estimatedTimeMonths ?? 0;

  // 嘗試延伸路徑
  let nextVisaId = currentStep.visaId;
  let depth = 0;
  const maxDepth = 3; // 最多顯示 3 步

  while (depth < maxDepth) {
    const nextVisa = VISA_KNOWLEDGE_BASE[nextVisaId];
    if (!nextVisa || !nextVisa.commonNextSteps || nextVisa.commonNextSteps.length === 0) {
      break;
    }

    // 找出下一步中 score 最高的
    const nextOptions = nextVisa.commonNextSteps
      .map(step => {
        const vid = step.visaId.toLowerCase();
        const v = VISA_KNOWLEDGE_BASE[vid];
        const s = recommendations[vid];
        
        if (!v || !s) return null;
        
        return {
          visaId: vid,
          visa: v,
          score: s,
          reason: step.reason,
          estimatedTimeMonths: getEstimatedTimeMonths(v),
        } as PathStep;
      })
      .filter((step): step is PathStep => step !== null)
      .sort((a, b) => b.score.matchPercentage - a.score.matchPercentage);

    if (nextOptions.length === 0 || nextOptions[0].score.matchPercentage < 50) {
      break; // 如果下一步的 match 太低，停止延伸
    }

    const bestNext = nextOptions[0];
    pathSteps.push(bestNext);
    totalMonths += bestNext.estimatedTimeMonths ?? 0;
    nextVisaId = bestNext.visaId;
    depth++;
  }

  // 確定信心等級
  const avgMatchPercentage = pathSteps.reduce((sum, step) => sum + step.score.matchPercentage, 0) / pathSteps.length;
  let confidence: 'high' | 'medium' | 'low';
  if (avgMatchPercentage >= 85) {
    confidence = 'high';
  } else if (avgMatchPercentage >= 60) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // 生成描述
  const description = generatePathDescription(pathSteps, currentVisa.name);

  return {
    steps: pathSteps,
    totalEstimatedMonths: totalMonths,
    description,
    confidence,
  };
}

/**
 * 為初次使用者（沒有當前簽證）推薦入門簽證
 */
function getEntryLevelRecommendation(recommendations: Record<string, VisaEligibilityScore>): RecommendedPath | null {
  // 常見的入門簽證
  const entryVisaIds = ['f1', 'j1', 'h1b', 'o1', 'l1'];
  
  const entryOptions = entryVisaIds
    .map(id => {
      const visa = VISA_KNOWLEDGE_BASE[id];
      const score = recommendations[id];
      
      if (!visa || !score) return null;
      
      return {
        visaId: id,
        visa,
        score,
        reason: 'Entry-level visa option based on your profile',
        estimatedTimeMonths: getEstimatedTimeMonths(visa),
      } as PathStep;
    })
    .filter((step): step is PathStep => step !== null)
    .sort((a, b) => b.score.matchPercentage - a.score.matchPercentage);

  if (entryOptions.length === 0) {
    return null;
  }

  const bestEntry = entryOptions[0];
  
  // 嘗試找出後續步驟
  const pathSteps: PathStep[] = [bestEntry];
  let totalMonths = bestEntry.estimatedTimeMonths ?? 0;

  if (bestEntry.visa.commonNextSteps && bestEntry.visa.commonNextSteps.length > 0) {
    const nextStep = bestEntry.visa.commonNextSteps[0];
    const nextVisa = VISA_KNOWLEDGE_BASE[nextStep.visaId.toLowerCase()];
    const nextScore = recommendations[nextStep.visaId.toLowerCase()];
    
    if (nextVisa && nextScore && nextScore.matchPercentage >= 50) {
      pathSteps.push({
        visaId: nextStep.visaId.toLowerCase(),
        visa: nextVisa,
        score: nextScore,
        reason: nextStep.reason,
        estimatedTimeMonths: getEstimatedTimeMonths(nextVisa),
      });
      totalMonths += getEstimatedTimeMonths(nextVisa);
    }
  }

  const avgMatch = pathSteps.reduce((sum, s) => sum + s.score.matchPercentage, 0) / pathSteps.length;
  const confidence: 'high' | 'medium' | 'low' = avgMatch >= 85 ? 'high' : avgMatch >= 60 ? 'medium' : 'low';

  return {
    steps: pathSteps,
    totalEstimatedMonths: totalMonths,
    description: `Based on your profile, we recommend starting with ${bestEntry.visa.name} and progressing towards ${pathSteps[pathSteps.length - 1].visa.name}.`,
    confidence,
  };
}

/**
 * 估算簽證的時間長度（月）
 */
function getEstimatedTimeMonths(visa: VisaDefinition): number {
  switch (visa.timeHorizon) {
    case 'short':
      return 9; // 6-12 months average
    case 'medium':
      return 24; // 1-3 years average
    case 'long':
      return 48; // 3-5+ years average
    default:
      return 12; // default 1 year
  }
}

/**
 * 生成路徑描述
 */
function generatePathDescription(steps: PathStep[], currentVisaName?: string): string {
  if (steps.length === 0) return '';
  
  if (steps.length === 1) {
    return `Your next recommended step: ${steps[0].visa.name}`;
  }
  
  const stepNames = steps.map(s => s.visa.name);
  
  if (currentVisaName) {
    return `From ${currentVisaName}, we recommend: ${stepNames.join(' → ')}`;
  } else {
    return `Recommended path: ${stepNames.join(' → ')}`;
  }
}
