export type TypingMode = 'mechanical' | 'free';

export type LineSpacing = 1 | 1.5 | 2;

export interface MarginSettings {
  left: number;  // Character column for left margin (e.g. 5)
  right: number; // Character column for right margin (e.g. 65)
  bellOffset?: number; // Columns before right margin to ring bell (default 5)
}

export interface SoundSettings {
  enabled: boolean;
  volume: number; // 0.0 to 1.0
}

export interface DocumentData {
  title: string;
  lines: string[];
  cursorRow: number;
  cursorCol: number;
  mode: TypingMode;
  margins: MarginSettings;
  lineSpacing: LineSpacing;
  soundEnabled: boolean;
  pageNumber?: number;
}

export interface StoredSheet {
  id: string;
  pageNumber: number;
  title: string;
  lines: string[];
  createdAt: number;
}

export interface KeyDefinition {
  code: string;
  char?: string;
  shiftChar?: string;
  display?: string;
  shiftDisplay?: string;
  width?: string;
  isModifier?: boolean;
  isAction?: boolean;
}

export type SoundEffect =
  | 'strike'
  | 'space'
  | 'backspace'
  | 'return'
  | 'bell'
  | 'platen'
  | 'shift'
  | 'tear';
