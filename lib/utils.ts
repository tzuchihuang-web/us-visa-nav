import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * VISA ID NORMALIZATION
 * 
 * Converts between:
 * - UI labels (with dashes): "F-1", "H-1B", "L-1B"
 * - Knowledge base IDs (no dashes, lowercase): "f1", "h1b", "l1b"
 * 
 * This ensures consistent visa identification across the app.
 */

// Mapping from UI label → knowledge base ID
export const VISA_UI_TO_ID: Record<string, string> = {
  'F-1': 'f1',
  'OPT': 'opt',
  'H-1B': 'h1b',
  'O-1': 'o1',
  'L-1': 'l1',
  'E-2': 'e2',
  'EB-1': 'eb1',
  'EB-2': 'eb2',
  // Add more as needed
};

// Mapping from knowledge base ID → UI label (for display)
export const VISA_ID_TO_UI: Record<string, string> = {
  'f1': 'F-1',
  'opt': 'OPT',
  'h1b': 'H-1B',
  'o1': 'O-1',
  'l1': 'L-1',
  'e2': 'E-2',
  'eb1': 'EB-1',
  'eb2': 'EB-2',
  // Add more as needed
};

/**
 * Normalize visa ID to knowledge base format (lowercase, no dashes)
 * 
 * Examples:
 * - normalizeVisaId("F-1") → "f1"
 * - normalizeVisaId("f1") → "f1"
 * - normalizeVisaId("F1") → "f1"
 * - normalizeVisaId(null) → null
 */
export function normalizeVisaId(visaInput: string | null | undefined): string | null {
  if (!visaInput) return null;
  
  // Try direct mapping first (user entered UI label like "F-1")
  const mapped = VISA_UI_TO_ID[visaInput];
  if (mapped) return mapped;
  
  // Otherwise, normalize by removing dashes and converting to lowercase
  const normalized = visaInput.replace(/-/g, '').toLowerCase();
  return normalized || null;
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

