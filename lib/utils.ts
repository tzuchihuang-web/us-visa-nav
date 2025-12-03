import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * VISA ID NORMALIZATION
 * 
 * Converts between:
 * - UI labels (with dashes): "F-1", "H-1B", "O-1", "L-1", "E-2", "EB-1", "EB-2"
 * - Knowledge base IDs (lowercase, no dashes): "f1", "h1b", "o1", "l1", "e2", "eb1", "eb2"
 * 
 * IMPORTANT: Knowledge base in lib/visa-knowledge-base.ts uses lowercase IDs without dashes.
 * This mapping is the authoritative source for converting between display and internal formats.
 */

// Mapping from UI label → knowledge base ID
// This is used when user selects a visa from dropdown or types in the field
export const VISA_UI_TO_ID: Record<string, string> = {
  'F-1': 'f1',
  'F1': 'f1',
  'f-1': 'f1',
  'f1': 'f1',
  'OPT': 'opt',
  'opt': 'opt',
  'H-1B': 'h1b',
  'H1B': 'h1b',
  'h-1b': 'h1b',
  'h1b': 'h1b',
  'O-1': 'o1',
  'O1': 'o1',
  'o-1': 'o1',
  'o1': 'o1',
  'L-1': 'l1',
  'L1': 'l1',
  'l-1': 'l1',
  'l1': 'l1',
  'E-2': 'e2',
  'E2': 'e2',
  'e-2': 'e2',
  'e2': 'e2',
  'EB-1': 'eb1',
  'EB1': 'eb1',
  'eb-1': 'eb1',
  'eb1': 'eb1',
  'EB-2': 'eb2',
  'EB2': 'eb2',
  'eb-2': 'eb2',
  'eb2': 'eb2',
};

// Mapping from knowledge base ID → UI label (for display)
// This is used when showing visa names in the UI
export const VISA_ID_TO_UI: Record<string, string> = {
  'f1': 'F-1',
  'opt': 'OPT',
  'h1b': 'H-1B',
  'o1': 'O-1',
  'l1': 'L-1',
  'e2': 'E-2',
  'eb1': 'EB-1',
  'eb2': 'EB-2',
};

/**
 * Normalize visa ID to knowledge base format (lowercase, no dashes)
 * 
 * Examples:
 * - normalizeVisaId("F-1") → "f1"
 * - normalizeVisaId("f1") → "f1"
 * - normalizeVisaId("F1") → "f1"
 * - normalizeVisaId("H-1B") → "h1b"
 * - normalizeVisaId(null) → null
 * - normalizeVisaId("invalid") → null (only returns valid IDs)
 * 
 * IMPORTANT: Only accepts values from VISA_UI_TO_ID map.
 * Partial matches during typing are ignored to prevent "f" or "1" bugs.
 */
export function normalizeVisaId(visaInput: string | null | undefined): string | null {
  if (!visaInput) return null;
  
  // Use explicit mapping only - no fuzzy matching
  // This prevents bugs where typing "F-1" character by character creates invalid IDs
  const trimmed = visaInput.trim();
  const mapped = VISA_UI_TO_ID[trimmed];
  
  if (mapped) {
    return mapped;
  }
  
  // If not in map, return null (don't try to normalize unknown values)
  console.warn(`[normalizeVisaId] Unknown visa format: "${trimmed}". Expected values: F-1, H-1B, O-1, L-1, E-2, EB-1, EB-2`);
  return null;
}

/**
 * Convert knowledge base ID to UI label for display
 * 
 * Examples:
 * - idToUiLabel("f1") → "F-1"
 * - idToUiLabel("h1b") → "H-1B"
 * - idToUiLabel(null) → null
 */
export function idToUiLabel(visaId: string | null | undefined): string | null {
  if (!visaId) return null;
  
  const normalized = visaId.toLowerCase();
  return VISA_ID_TO_UI[normalized] || null;
}

