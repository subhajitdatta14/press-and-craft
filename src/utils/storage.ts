import { DocumentData, LineSpacing, MarginSettings, StoredSheet, TypingMode } from '../types';

const STORAGE_KEY_V2 = 'typewright_state_v2';
const STORAGE_KEY_V1 = 'typewright_state_v1';
const STORAGE_KEY_SHEETS = 'typewright_stored_sheets_v1';

export const DEFAULT_MARGINS: MarginSettings = {
  left: 5,   // Characters from paper edge
  right: 65, // Characters from paper edge (standard 60 char printable width)
  bellOffset: 5, // Rings at right - bellOffset (e.g. 60)
};

export const DEFAULT_DOCUMENT: DocumentData = {
  title: 'UNTITLED',
  lines: [''],
  cursorRow: 0,
  cursorCol: DEFAULT_MARGINS.left,
  mode: 'mechanical',
  margins: DEFAULT_MARGINS,
  lineSpacing: 1,
  soundEnabled: true,
  pageNumber: 1,
};

export function loadSavedState(): DocumentData {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY_V2);
      localStorage.removeItem(STORAGE_KEY_V1);
    } catch {
      // ignore
    }
  }
  return DEFAULT_DOCUMENT;
}

export function saveState(_data: DocumentData): void {
  // Do not persist previous state to localStorage across website refreshes/reopens
}

export function loadStoredSheets(): StoredSheet[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY_SHEETS);
    } catch {
      // ignore
    }
  }
  return [];
}

export function saveStoredSheets(_sheets: StoredSheet[]): void {
  // Do not persist previous sheets to localStorage across website refreshes/reopens
}

export function clearSavedState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_V2);
    localStorage.removeItem(STORAGE_KEY_V1);
  } catch (e) {
    console.warn('Failed to clear TYPEWRIGHT state:', e);
  }
}

export function clearStoredSheets(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_SHEETS);
  } catch (e) {
    console.warn('Failed to clear stored sheets:', e);
  }
}

