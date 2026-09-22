/**
 * TYPEWRIGHT — A Digital Mechanical Typewriter
 * Recreating the tactile, authentic experience of a classic physical typewriter in the browser.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, FilePlus, Download, Trash2, Printer, FileText, Info, Layers, BookOpen, Menu, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { DocumentData, KeyDefinition, LineSpacing, MarginSettings, StoredSheet, TypingMode } from './types';
import { playTypewriterSound, initOrUnlockAudio } from './utils/audio';
import {
  clearSavedState,
  clearStoredSheets,
  DEFAULT_DOCUMENT,
  DEFAULT_MARGINS,
  loadSavedState,
  loadStoredSheets,
  saveState,
  saveStoredSheets,
} from './utils/storage';
import { TypewriterMachine } from './components/TypewriterMachine';
import { Controls } from './components/Controls';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { PressCraftCover } from './components/PressCraftCover';
import { AboutModal } from './components/AboutModal';
import { ExpandedPaperModal } from './components/ExpandedPaperModal';
import { WoodenDeskBackground } from './components/WoodenDeskBackground';

// Standard A4 Sheet Maximum Printable Lines (at typewriter pica spacing)
const A4_MAX_LINES = 25;

export default function App() {
  // Always start with fresh clean sheet at page 1 and empty stored sheets on website open/refresh
  const [docState, setDocState] = useState<DocumentData>(DEFAULT_DOCUMENT);
  const [storedSheets, setStoredSheets] = useState<StoredSheet[]>([]);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [isCapsLockActive, setIsCapsLockActive] = useState(false);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [isCarriageReturning, setIsCarriageReturning] = useState(false);
  const [isMarginReleased, setIsMarginReleased] = useState(false);
  const [hasPlayedBellOnLine, setHasPlayedBellOnLine] = useState(false);
  const [hasPlayedPageCompleteBell, setHasPlayedPageCompleteBell] = useState(false);
  const [isHammerStriking, setIsHammerStriking] = useState(false);
  const [isBellRinging, setIsBellRinging] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false);
  const [isTearing, setIsTearing] = useState(false);
  const [isInsertingSheet, setIsInsertingSheet] = useState(false);
  const [isExpandedModalOpen, setIsExpandedModalOpen] = useState(false);
  const [selectedSheetForView, setSelectedSheetForView] = useState<StoredSheet | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSheetsMenuOpen, setIsSheetsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [developerCredits, setDeveloperCredits] = useState<string | null>(null);
  const developerCreditsRef = useRef<string | null>(developerCredits);
  useEffect(() => {
    developerCreditsRef.current = developerCredits;
  }, [developerCredits]);

  // Easter egg tracking: "when website open and i type HISTORY in caps and then press return button 4 times"
  const historyEggTypedRef = useRef<string>('');
  const historyEggArmedRef = useRef<boolean>(false);
  const historyEggReturnCountRef = useRef<number>(0);
  const creditsDismissedRef = useRef<boolean>(false);
  const shiftPressCountRef = useRef<number>(0);
  const lastShiftPressTimeRef = useRef<number>(0);

  // Close developer credits automatically when pressing shift two times
  const handleShiftCloseCredits = useCallback(() => {
    if (!developerCreditsRef.current) {
      shiftPressCountRef.current = 0;
      return;
    }
    const now = Date.now();
    if (now - lastShiftPressTimeRef.current > 3000) {
      shiftPressCountRef.current = 1;
    } else {
      shiftPressCountRef.current += 1;
    }
    lastShiftPressTimeRef.current = now;

    if (shiftPressCountRef.current >= 2) {
      setDeveloperCredits(null);
      creditsDismissedRef.current = true;
      shiftPressCountRef.current = 0;
      historyEggTypedRef.current = '';
      historyEggArmedRef.current = false;
      historyEggReturnCountRef.current = 0;
    }
  }, []);

  // Dialog states
  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    confirmVariant?: 'danger' | 'warning' | 'primary';
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    action: () => {},
  });

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const lastKeyProcessedTimeRef = useRef<{ char: string; time: number }>({ char: '', time: 0 });

  // Synchronized state refs to prevent stale closure bugs in keyboard and return handlers
  const docStateRef = useRef(docState);
  useEffect(() => {
    docStateRef.current = docState;
  }, [docState]);

  const isTearingRef = useRef(isTearing);
  useEffect(() => {
    isTearingRef.current = isTearing;
  }, [isTearing]);

  const isInsertingSheetRef = useRef(isInsertingSheet);
  useEffect(() => {
    isInsertingSheetRef.current = isInsertingSheet;
  }, [isInsertingSheet]);

  const isCarriageReturningRef = useRef(isCarriageReturning);
  useEffect(() => {
    isCarriageReturningRef.current = isCarriageReturning;
  }, [isCarriageReturning]);

  // Auto-focus typewriter container so keyboard events work immediately on open/refresh
  const focusTypewriter = useCallback(() => {
    initOrUnlockAudio();
    if (typeof window !== 'undefined') {
      window.focus();
    }
    if (typeof document !== 'undefined' && document.body && document.activeElement === null) {
      document.body.focus();
    }
    if (mainContainerRef.current) {
      mainContainerRef.current.focus({ preventScroll: true });
    }
  }, []);

  useEffect(() => {
    focusTypewriter();
    // Wipe any previously saved storage so open/refresh is always completely clean
    clearSavedState();
    clearStoredSheets();

    // Re-focus over the initial loading sequence to ensure the window has immediate keyboard input focus
    const t1 = setTimeout(focusTypewriter, 50);
    const t2 = setTimeout(focusTypewriter, 200);
    const t3 = setTimeout(focusTypewriter, 600);
    const t4 = setTimeout(focusTypewriter, 1200);
    const t5 = setTimeout(focusTypewriter, 2050);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [focusTypewriter]);

  // When refreshing or opening the page, show 1st page and automatically open 2nd page after 2 seconds
  useEffect(() => {
    if (!showCover) {
      // Re-focus immediately as soon as the cover is dismissed or unmounted
      focusTypewriter();
      const t1 = setTimeout(focusTypewriter, 40);
      const t2 = setTimeout(focusTypewriter, 150);
      const t3 = setTimeout(focusTypewriter, 350);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
    const timer = window.setTimeout(() => {
      setShowCover(false);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [showCover, focusTypewriter]);

  // Keep typewriter keyboard focused whenever user interacts or moves mouse
  useEffect(() => {
    const onUserInteraction = () => {
      focusTypewriter();
    };

    window.addEventListener('pointerenter', onUserInteraction);
    window.addEventListener('pointerdown', onUserInteraction);
    window.addEventListener('mouseenter', onUserInteraction);
    window.addEventListener('mousedown', onUserInteraction);
    window.addEventListener('focus', onUserInteraction);

    return () => {
      window.removeEventListener('pointerenter', onUserInteraction);
      window.removeEventListener('pointerdown', onUserInteraction);
      window.removeEventListener('mouseenter', onUserInteraction);
      window.removeEventListener('mousedown', onUserInteraction);
      window.removeEventListener('focus', onUserInteraction);
    };
  }, [focusTypewriter]);

  // Helper to trigger type hammer animation
  const triggerTypeHammer = useCallback(() => {
    setIsHammerStriking(true);
    setTimeout(() => {
      setIsHammerStriking(false);
    }, 75);
  }, []);

  // Helper to trigger bell chime & visual ring
  const triggerBellChime = useCallback(() => {
    if (docStateRef.current.soundEnabled) {
      playTypewriterSound('bell', 0.9);
    }
    setIsBellRinging(true);
    setTimeout(() => {
      setIsBellRinging(false);
    }, 450);
  }, []);

  // Page completion check: when typing reaches maximum A4 page lines
  const isPageComplete = docState.lines.length >= A4_MAX_LINES || docState.cursorRow >= A4_MAX_LINES - 1;

  // Trigger bell chime automatically when page completes
  useEffect(() => {
    if (isPageComplete && !hasPlayedPageCompleteBell) {
      if (docState.soundEnabled) {
        playTypewriterSound('bell', 1.0);
      }
      setIsBellRinging(true);
      setTimeout(() => {
        setIsBellRinging(false);
      }, 500);
      setHasPlayedPageCompleteBell(true);
    } else if (!isPageComplete && hasPlayedPageCompleteBell) {
      setHasPlayedPageCompleteBell(false);
    }
  }, [isPageComplete, hasPlayedPageCompleteBell, docState.soundEnabled]);

  // --------------------------------------------------------------------------
  // CENTRALIZED MECHANICAL ENGINE
  // --------------------------------------------------------------------------

  // Unified Carriage Return (performCarriageReturn)
  // Shared by Enter key, on-screen RETURN key, and Physical Carriage Return Lever
  const executeCarriageReturn = useCallback(() => {
    if (isCarriageReturningRef.current || isTearingRef.current || isInsertingSheetRef.current) return;

    const currentDoc = docStateRef.current;

    // Check if the current sheet has reached the bottom limit (22 lines)
    if (currentDoc.cursorRow >= A4_MAX_LINES - 1) {
      if (currentDoc.soundEnabled) {
        playTypewriterSound('bell', 1.0);
      }
      setIsBellRinging(true);
      setTimeout(() => {
        setIsBellRinging(false);
      }, 450);
      return;
    }

    if (currentDoc.soundEnabled) {
      playTypewriterSound('return', 0.75);
    }

    // Easter Egg check: "type HISTORY in caps and then press return button 4 times"
    if (historyEggArmedRef.current && !creditsDismissedRef.current) {
      historyEggReturnCountRef.current += 1;
      if (historyEggReturnCountRef.current >= 4) {
        setDeveloperCredits('DEVELOPED BY SUBHAJIT DATTA 22TH SEPT 2026');
        shiftPressCountRef.current = 0;
        historyEggArmedRef.current = false;
      }
    } else if (!creditsDismissedRef.current) {
      const historyIndex = currentDoc.lines.findIndex((l) => l.includes('HISTORY'));
      if (historyIndex !== -1 && currentDoc.cursorRow >= historyIndex) {
        if (currentDoc.cursorRow - historyIndex + 1 >= 4) {
          setDeveloperCredits('DEVELOPED BY SUBHAJIT DATTA 22TH SEPT 2026');
          shiftPressCountRef.current = 0;
        }
      }
    }

    setIsCarriageReturning(true);
    setIsFeeding(true);
    setHasPlayedBellOnLine(false);
    setIsMarginReleased(false); // Reset margin release for new line

    setDocState((prev) => {
      // Guard against exceeding A4 limit inside state updater
      if (prev.cursorRow >= A4_MAX_LINES - 1) {
        return prev;
      }

      const nextRow = prev.cursorRow + 1;
      const updatedLines = [...prev.lines];

      // Pad previous line up to cursorCol if needed
      const currentLine = updatedLines[prev.cursorRow] || '';
      if (currentLine.length < prev.cursorCol) {
        updatedLines[prev.cursorRow] = currentLine.padEnd(prev.cursorCol, ' ');
      }

      // If advancing beyond lines, add new line with left margin indent
      while (updatedLines.length <= nextRow) {
        updatedLines.push(' '.repeat(prev.margins.left));
      }

      return {
        ...prev,
        lines: updatedLines,
        cursorRow: nextRow,
        cursorCol: prev.margins.left,
      };
    });

    setTimeout(() => {
      setIsCarriageReturning(false);
      setIsFeeding(false);
    }, 320);
  }, []);

  // Paper Feed Execution (1, 2, or 3 lines)
  const feedPaper = useCallback(
    (lineCount: 1 | 2 | 3) => {
      if (docState.soundEnabled) {
        playTypewriterSound('platen', 0.65);
      }
      setIsFeeding(true);

      setDocState((prev) => {
        const nextRow = prev.cursorRow + lineCount;
        const updatedLines = [...prev.lines];

        while (updatedLines.length <= nextRow) {
          updatedLines.push(' '.repeat(prev.margins.left));
        }

        return {
          ...prev,
          lines: updatedLines,
          cursorRow: nextRow,
          // Cursor column remains horizontally unchanged
          cursorCol: prev.cursorCol,
        };
      });

      setTimeout(() => {
        setIsFeeding(false);
      }, 220);
    },
    [docState.soundEnabled]
  );

  // Margin Release (MAR REL)
  const handleMarginRelease = useCallback(() => {
    if (docState.soundEnabled) {
      playTypewriterSound('platen', 0.55);
    }
    setIsMarginReleased(true);
  }, [docState.soundEnabled]);

  // Backspace Execution
  const executeBackspace = useCallback(() => {
    if (isCarriageReturning) return;

    if (historyEggTypedRef.current.length > 0) {
      historyEggTypedRef.current = historyEggTypedRef.current.slice(0, -1);
    }

    if (docState.soundEnabled) {
      playTypewriterSound('backspace', 0.6);
    }

    setDocState((prev) => {
      // In mechanical mode, back button only moves carriage backward without deleting letter
      if (prev.mode === 'mechanical') {
        if (prev.cursorCol <= prev.margins.left) {
          return prev;
        }

        const newCol = prev.cursorCol - 1;
        return {
          ...prev,
          cursorCol: newCol,
        };
      } else {
        // Free mode: normal backspace that deletes letter
        if (prev.cursorCol > prev.margins.left) {
          const newCol = prev.cursorCol - 1;
          const currentLine = prev.lines[prev.cursorRow] || '';
          const updatedLine = currentLine.slice(0, newCol) + currentLine.slice(newCol + 1);
          const updatedLines = [...prev.lines];
          updatedLines[prev.cursorRow] = updatedLine;
          return { ...prev, lines: updatedLines, cursorCol: newCol };
        } else if (prev.cursorRow > 0) {
          const prevRow = prev.cursorRow - 1;
          const prevLine = prev.lines[prevRow] || '';
          return {
            ...prev,
            cursorRow: prevRow,
            cursorCol: Math.min(prev.margins.right, Math.max(prev.margins.left, prevLine.length)),
          };
        }
        return prev;
      }
    });
  }, [docState.soundEnabled, isCarriageReturning]);

  // Space Bar Execution
  const executeSpace = useCallback(() => {
    if (isCarriageReturning) return;

    triggerTypeHammer();

    setDocState((prev) => {
      // Check margin stops in mechanical mode
      if (prev.mode === 'mechanical') {
        const hardLimit = prev.margins.right + (isMarginReleased ? 8 : 0);
        if (prev.cursorCol >= hardLimit) {
          if (prev.soundEnabled) {
            playTypewriterSound('strike', 0.3);
          }
          return prev;
        }
      }

      if (prev.soundEnabled) {
        playTypewriterSound('space', 0.55);
      }

      const currentLine = prev.lines[prev.cursorRow] || '';
      let updatedLine = currentLine;
      if (prev.cursorCol >= currentLine.length) {
        updatedLine = currentLine.padEnd(prev.cursorCol + 1, ' ');
      } else {
        updatedLine = currentLine.slice(0, prev.cursorCol) + ' ' + currentLine.slice(prev.cursorCol + 1);
      }

      const nextCol = prev.cursorCol + 1;
      const bellCol = prev.margins.right - (prev.margins.bellOffset ?? 5);

      // Margin bell warning check
      if (nextCol >= bellCol && !hasPlayedBellOnLine) {
        triggerBellChime();
        setHasPlayedBellOnLine(true);
      }

      const updatedLines = [...prev.lines];
      updatedLines[prev.cursorRow] = updatedLine;

      return {
        ...prev,
        lines: updatedLines,
        cursorCol: nextCol,
      };
    });
  }, [hasPlayedBellOnLine, isCarriageReturning, isMarginReleased, triggerBellChime, triggerTypeHammer]);

  // Tab Key Execution
  const executeTab = useCallback(() => {
    if (isCarriageReturning) return;

    if (docState.soundEnabled) {
      playTypewriterSound('strike', 0.45);
    }

    setDocState((prev) => {
      const hardLimit = prev.mode === 'mechanical' && !isMarginReleased ? prev.margins.right : prev.margins.right + 8;
      const nextCol = Math.min(hardLimit, prev.cursorCol + 5);

      const bellCol = prev.margins.right - (prev.margins.bellOffset ?? 5);
      if (nextCol >= bellCol && !hasPlayedBellOnLine) {
        triggerBellChime();
        setHasPlayedBellOnLine(true);
      }

      return {
        ...prev,
        cursorCol: nextCol,
      };
    });
  }, [docState.soundEnabled, hasPlayedBellOnLine, isCarriageReturning, isMarginReleased, triggerBellChime]);

  // Printable Character Execution
  const executePrintableChar = useCallback(
    (char: string) => {
      if (isCarriageReturning) return;

      triggerTypeHammer();

      // Trigger audio immediately for crisp zero-latency tactile feedback
      if (docStateRef.current.soundEnabled) {
        playTypewriterSound('strike', 0.6);
      }

      // Track HISTORY easter egg sequence in caps
      historyEggTypedRef.current = (historyEggTypedRef.current + char).slice(-10);
      if (historyEggTypedRef.current.endsWith('HISTORY')) {
        historyEggArmedRef.current = true;
        historyEggReturnCountRef.current = 0;
        creditsDismissedRef.current = false;
      } else if (historyEggArmedRef.current && char.trim() !== '') {
        historyEggArmedRef.current = false;
        historyEggReturnCountRef.current = 0;
      }

      setDocState((prev) => {
        // In Mechanical Mode: Check right margin stop!
        if (prev.mode === 'mechanical') {
          const hardLimit = prev.margins.right + (isMarginReleased ? 8 : 0);
          if (prev.cursorCol >= hardLimit) {
            // Reached margin stop: carriage is locked!
            if (!hasPlayedBellOnLine && prev.soundEnabled) {
              triggerBellChime();
              setHasPlayedBellOnLine(true);
            } else if (prev.soundEnabled) {
              playTypewriterSound('strike', 0.3); // muted clank
            }
            return prev; // STOP NORMAL TYPING
          }
        }

        const currentLine = prev.lines[prev.cursorRow] || '';
        let updatedLine = '';

        if (prev.cursorCol >= currentLine.length) {
          updatedLine = currentLine.padEnd(prev.cursorCol, ' ') + char;
        } else {
          updatedLine = currentLine.slice(0, prev.cursorCol) + char + currentLine.slice(prev.cursorCol + 1);
        }

        const updatedLines = [...prev.lines];
        updatedLines[prev.cursorRow] = updatedLine;
        const nextCol = prev.cursorCol + 1;

        // Margin bell warning chime
        const bellCol = prev.margins.right - (prev.margins.bellOffset ?? 5);
        if (nextCol >= bellCol && !hasPlayedBellOnLine) {
          triggerBellChime();
          setHasPlayedBellOnLine(true);
        }

        // In Free Mode: auto wrap if past right margin
        if (prev.mode === 'free' && nextCol > prev.margins.right) {
          setIsFeeding(true);
          setTimeout(() => setIsFeeding(false), 250);
          updatedLines.push(' '.repeat(prev.margins.left));
          return {
            ...prev,
            lines: updatedLines,
            cursorRow: prev.cursorRow + 1,
            cursorCol: prev.margins.left,
          };
        }

        return {
          ...prev,
          lines: updatedLines,
          cursorCol: nextCol,
        };
      });
    },
    [hasPlayedBellOnLine, isCarriageReturning, isMarginReleased, triggerBellChime, triggerTypeHammer]
  );

  // Unified Key Press Handler (Used by on-screen keyboard)
  const handleKeyPress = useCallback(
    (keyDef: KeyDefinition) => {
      if (keyDef.code === 'Enter') {
        executeCarriageReturn();
        return;
      }

      if (keyDef.code === 'Backspace') {
        executeBackspace();
        return;
      }

      if (keyDef.code === 'Space') {
        executeSpace();
        return;
      }

      if (keyDef.code === 'Tab') {
        executeTab();
        return;
      }

      if (keyDef.code === 'CapsLock') {
        setIsCapsLockActive((prev) => !prev);
        if (docState.soundEnabled) {
          playTypewriterSound('shift', 0.4);
        }
        return;
      }

      if (keyDef.code === 'ShiftLeft' || keyDef.code === 'ShiftRight') {
        setIsShiftActive((prev) => !prev);
        handleShiftCloseCredits();
        if (docState.soundEnabled) {
          playTypewriterSound('shift', 0.4);
        }
        return;
      }

      // Determine char to type based on shift and caps lock
      let charToType = keyDef.char;
      if (isShiftActive && keyDef.shiftChar) {
        charToType = keyDef.shiftChar;
      } else if (isCapsLockActive && keyDef.char && keyDef.shiftChar && !keyDef.shiftDisplay) {
        charToType = keyDef.shiftChar;
      }

      if (charToType) {
        executePrintableChar(charToType);
      }
    },
    [
      executeCarriageReturn,
      executeBackspace,
      executeSpace,
      executeTab,
      executePrintableChar,
      isShiftActive,
      isCapsLockActive,
      docState.soundEnabled,
      handleShiftCloseCredits,
    ]
  );

  // Easter egg: when website open and i type HISTORY in caps and then press return button 4 times
  useEffect(() => {
    if (developerCredits || creditsDismissedRef.current) return;
    const historyLineIndex = docState.lines.findIndex((l) => l.includes('HISTORY'));
    if (historyLineIndex !== -1 && docState.cursorRow >= historyLineIndex + 4) {
      let onlyReturnsInBetween = true;
      for (let i = historyLineIndex + 1; i <= docState.cursorRow; i++) {
        if (docState.lines[i] && docState.lines[i].trim() !== '') {
          onlyReturnsInBetween = false;
          break;
        }
      }
      if (onlyReturnsInBetween) {
        setDeveloperCredits('DEVELOPED BY SUBHAJIT DATTA  22TH SEPTEMBER');
        shiftPressCountRef.current = 0;
      }
    }
  }, [docState.lines, docState.cursorRow, developerCredits]);

  // --------------------------------------------------------------------------
  // PAPER / DOCUMENT CONTROLS & MULTI-PAGE ARCHIVE
  // --------------------------------------------------------------------------

  // Insert New Sheet Workflow:
  // 1. Plays paper tear animation with physical tearing sound
  // 2. Automatically archives the current sheet to storedSheets (stored in left side option)
  // 3. Automatically advances pageNumber
  // 4. Plays sheet insert animation with mechanical feed sound
  // 5. Resets typing lines to start fresh on the new A4 sheet
  const handleInsertNewSheet = useCallback(() => {
    if (isTearingRef.current || isInsertingSheetRef.current) return;

    setIsTearing(true);
    playTypewriterSound('tear', 0.9);

    const currentDoc = docStateRef.current;
    const currentPageNum = currentDoc.pageNumber || 1;
    const hasContent =
      currentDoc.lines.some((l) => l.trim().length > 0) ||
      (currentDoc.title.trim().length > 0 && currentDoc.title !== 'UNTITLED');

    // Automatically store previous sheet in left-side storage
    if (hasContent) {
      const sheetRecord: StoredSheet = {
        id: `sheet-${Date.now()}-p${currentPageNum}`,
        pageNumber: currentPageNum,
        title: currentDoc.title.trim() || `SHEET ${currentPageNum}`,
        lines: [...currentDoc.lines],
        createdAt: Date.now(),
      };
      setStoredSheets((prev) => [...prev, sheetRecord]);
    }

    // After tearing completes (~500ms), insert the fresh A4 sheet
    setTimeout(() => {
      setIsTearing(false);
      setIsInsertingSheet(true);
      setHasPlayedPageCompleteBell(false);
      setIsMarginReleased(false);
      setHasPlayedBellOnLine(false);
      setIsSheetsMenuOpen(false);

      // Advance page number automatically!
      const nextPageNum = currentPageNum + 1;
      setDocState((prev) => ({
        ...prev,
        lines: [' '.repeat(prev.margins.left)],
        cursorRow: 0,
        cursorCol: prev.margins.left,
        pageNumber: nextPageNum,
      }));

      // Mechanical paper insert feed sound
      if (docStateRef.current.soundEnabled) {
        playTypewriterSound('platen', 0.85);
      }

      // Finish sheet insert animation and focus typewriter
      setTimeout(() => {
        setIsInsertingSheet(false);
        focusTypewriter();
      }, 500);
    }, 500);
  }, [focusTypewriter]);

  const handleLoadStoredSheet = (sheet: StoredSheet) => {
    // If current sheet has content, archive it first
    const hasContent =
      docState.lines.some((l) => l.trim().length > 0) ||
      (docState.title.trim().length > 0 && docState.title !== 'UNTITLED');

    if (hasContent && (docState.pageNumber || 1) !== sheet.pageNumber) {
      const activeSheetRecord: StoredSheet = {
        id: `sheet-${Date.now()}-p${docState.pageNumber || 1}`,
        pageNumber: docState.pageNumber || 1,
        title: docState.title.trim() || `SHEET ${docState.pageNumber || 1}`,
        lines: [...docState.lines],
        createdAt: Date.now(),
      };
      setStoredSheets((prev) => [...prev.filter((s) => s.id !== sheet.id), activeSheetRecord]);
    } else {
      setStoredSheets((prev) => prev.filter((s) => s.id !== sheet.id));
    }

    setDocState((prev) => ({
      ...prev,
      title: sheet.title,
      lines: sheet.lines,
      cursorRow: 0,
      cursorCol: prev.margins.left,
      pageNumber: sheet.pageNumber,
    }));
    playTypewriterSound('platen', 0.7);
    focusTypewriter();
  };

  const handleClearStoredSheetsRequest = () => {
    setDialogConfig({
      isOpen: true,
      title: 'Clear Stored Sheets Archive?',
      message: 'This will delete all saved previous sheets from the archive.',
      confirmLabel: 'CLEAR ARCHIVE',
      confirmVariant: 'danger',
      action: () => {
        clearStoredSheets();
        setStoredSheets([]);
        setDialogConfig((d) => ({ ...d, isOpen: false }));
        focusTypewriter();
      },
    });
  };

  const handleNewSheetRequest = () => {
    handleInsertNewSheet();
  };

  const handleClearRequest = () => {
    setDialogConfig({
      isOpen: true,
      title: 'Clear Paper?',
      message: 'Are you sure you want to clear all text from this sheet?',
      confirmLabel: 'CLEAR',
      confirmVariant: 'danger',
      action: () => {
        setDeveloperCredits(null);
        creditsDismissedRef.current = false;
        shiftPressCountRef.current = 0;
        historyEggTypedRef.current = '';
        historyEggArmedRef.current = false;
        historyEggReturnCountRef.current = 0;
        setDocState((prev) => ({
          ...prev,
          lines: [' '.repeat(prev.margins.left)],
          cursorRow: 0,
          cursorCol: prev.margins.left,
        }));
        setIsMarginReleased(false);
        setHasPlayedBellOnLine(false);
        setDialogConfig((d) => ({ ...d, isOpen: false }));
        focusTypewriter();
      },
    });
  };

  // Tear Paper: plays authentic physical rip sound, animates paper lifting away, opens full expanded sheet modal
  const handleTearPaper = () => {
    if (isTearing || isInsertingSheet) return;
    setIsTearing(true);
    playTypewriterSound('tear', 0.9);

    // After tear animation plays (~550ms), show the expanded paper modal
    setTimeout(() => {
      setSelectedSheetForView(null);
      setIsExpandedModalOpen(true);
      setIsTearing(false);
    }, 600);
  };

  const handleResetRequest = () => {
    setDialogConfig({
      isOpen: true,
      title: 'Reset Typewriter?',
      message: 'This will restore factory defaults (Mechanical Mode, 1x line feed, default margins) and clear the paper.',
      confirmLabel: 'RESET MACHINE',
      confirmVariant: 'danger',
      action: () => {
        clearSavedState();
        setDeveloperCredits(null);
        creditsDismissedRef.current = false;
        shiftPressCountRef.current = 0;
        historyEggTypedRef.current = '';
        historyEggArmedRef.current = false;
        historyEggReturnCountRef.current = 0;
        setDocState(DEFAULT_DOCUMENT);
        setIsMarginReleased(false);
        setHasPlayedBellOnLine(false);
        setDialogConfig((d) => ({ ...d, isOpen: false }));
        focusTypewriter();
      },
    });
  };

  const handleDownloadAllPdf = () => {
    playTypewriterSound('platen', 0.65);

    const allSheets = [
      ...storedSheets,
      {
        id: 'active',
        pageNumber: docState.pageNumber || (storedSheets.length + 1),
        title: docState.title,
        lines: docState.lines,
        createdAt: Date.now(),
      },
    ];

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 54; // 0.75 in margin

    const baseLineHeight = 15;
    const effectiveLineHeight = baseLineHeight * (docState.lineSpacing || 1);

    allSheets.forEach((sheet, index) => {
      if (index > 0) {
        doc.addPage();
      }

      // Vintage warm ivory page background matching paper-texture
      doc.setFillColor(250, 245, 198);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Sheet content lines in typewriter Courier
      doc.setFont('courier', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(30, 27, 21);

      let currentY = margin + 30;
      for (let i = 0; i < sheet.lines.length; i++) {
        const line = sheet.lines[i] || '';
        doc.text(line, margin, currentY);
        currentY += effectiveLineHeight;
      }

      // Below rightside page number in PDF only
      const pageNo = String(sheet.pageNumber || index + 1);
      doc.setFont('courier', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(70, 65, 52);
      doc.text(pageNo, pageWidth - margin, pageHeight - 36, { align: 'right' });
    });

    const safeTitle = docState.title.trim()
      ? docState.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : 'typewright-sheet';
    const filename = `${safeTitle}-${allSheets.length > 1 ? `all-${allSheets.length}-pages` : 'page-1'}.pdf`;

    doc.save(filename);
  };

  const handleDownloadTxt = () => {
    const titleHeader = docState.title.trim() ? `${docState.title.trim().toUpperCase()}\n${'='.repeat(docState.title.trim().length)}\n\n` : '';
    const content = titleHeader + docState.lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = docState.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'typewright-sheet';
    link.href = url;
    link.download = `${safeTitle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePaperClick = (row: number, col: number) => {
    if (docState.mode === 'free') {
      setDocState((prev) => ({
        ...prev,
        cursorRow: Math.min(prev.lines.length - 1, Math.max(0, row)),
        cursorCol: Math.min(prev.margins.right, Math.max(prev.margins.left, col)),
      }));
    } else {
      // In mechanical mode, clicking paper focuses machine or mobile input
      focusTypewriter();
      if (mobileInputRef.current) {
        mobileInputRef.current.focus();
      }
    }
  };

  // --------------------------------------------------------------------------
  // PHYSICAL KEYBOARD LISTENER (Desktop / Laptop)
  // --------------------------------------------------------------------------
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't capture when typing inside the title input or modal
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        if (activeEl.id !== 'mobile-typewriter-capture') {
          return;
        }
      }
      if (dialogConfig.isOpen) {
        return;
      }

      // If intro cover is still up on refresh/open, dismiss it immediately so user can type without waiting
      if (showCover) {
        setShowCover(false);
      }

      // Keyboard Shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          handleNewSheetRequest();
          return;
        }
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          handleDownloadTxt();
          return;
        }
        if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          handlePrint();
          return;
        }
      }

      // Arrow keys in Free Mode
      if (docState.mode === 'free') {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setDocState((prev) => ({
            ...prev,
            cursorCol: Math.max(prev.margins.left, prev.cursorCol - 1),
          }));
          return;
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          setDocState((prev) => ({
            ...prev,
            cursorCol: Math.min(prev.margins.right, prev.cursorCol + 1),
          }));
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setDocState((prev) => ({
            ...prev,
            cursorRow: Math.max(0, prev.cursorRow - 1),
          }));
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setDocState((prev) => ({
            ...prev,
            cursorRow: Math.min(prev.lines.length - 1, prev.cursorRow + 1),
          }));
          return;
        }
      }

      // Animate physical key depression
      setPressedKeys((prev) => new Set(prev).add(e.code));

      // Track shift / caps
      if (e.key === 'Shift') {
        setIsShiftActive(true);
        if (!e.repeat) {
          handleShiftCloseCredits();
        }
      }
      setIsCapsLockActive(e.getModifierState('CapsLock'));

      // Mechanical Typewriter Handlers
      if (e.key === 'Enter') {
        e.preventDefault();
        executeCarriageReturn();
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        executeBackspace();
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        executeSpace();
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        executeTab();
        return;
      }

      // Printable single character keys
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        executePrintableChar(e.key);
      }
    },
    [
      dialogConfig.isOpen,
      docState.mode,
      executeCarriageReturn,
      executeBackspace,
      executeSpace,
      executeTab,
      executePrintableChar,
      handleShiftCloseCredits,
      handleNewSheetRequest,
      handleDownloadTxt,
      handlePrint,
      showCover,
    ]
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setPressedKeys((prev) => {
      const next = new Set(prev);
      next.delete(e.code);
      return next;
    });

    if (e.key === 'Shift') {
      setIsShiftActive(false);
    }
    setIsCapsLockActive(e.getModifierState('CapsLock'));
  }, []);

  // Stable listener refs so window event listeners are permanently attached once on mount
  // without being torn down and rebuilt on every state change or keystroke
  const handleKeyDownRef = useRef(handleKeyDown);
  const handleKeyUpRef = useRef(handleKeyUp);
  handleKeyDownRef.current = handleKeyDown;
  handleKeyUpRef.current = handleKeyUp;

  const lastProcessedKeyEventRef = useRef<KeyboardEvent | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Prevent duplicate processing when both window and document receive the same event in capture/bubble phases
      if (lastProcessedKeyEventRef.current === e) return;
      lastProcessedKeyEventRef.current = e;
      handleKeyDownRef.current(e);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      handleKeyUpRef.current(e);
    };

    window.addEventListener('keydown', onKeyDown, { passive: false, capture: true });
    document.addEventListener('keydown', onKeyDown, { passive: false, capture: true });
    window.addEventListener('keyup', onKeyUp, { capture: true });
    document.addEventListener('keyup', onKeyUp, { capture: true });

    return () => {
      window.removeEventListener('keydown', onKeyDown, { capture: true });
      document.removeEventListener('keydown', onKeyDown, { capture: true });
      window.removeEventListener('keyup', onKeyUp, { capture: true });
      document.removeEventListener('keyup', onKeyUp, { capture: true });
    };
  }, []);

  return (
    <div
      ref={mainContainerRef}
      tabIndex={0}
      autoFocus
      onClick={() => {
        focusTypewriter();
      }}
      className="relative min-h-screen w-full bg-transparent text-[#E4DEC9] flex flex-col justify-between pt-0 pb-2 sm:pb-4 px-0.5 sm:px-4 outline-none selection:bg-[#c29b62]/30 overflow-x-hidden"
    >
      {/* Authentic Wooden Desk Background matching reference photograph */}
      <WoodenDeskBackground />
      {/* Hidden Mobile Input for soft keyboards */}
      <input
        ref={mobileInputRef}
        id="mobile-typewriter-capture"
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        className="sr-only opacity-0 w-0 h-0 pointer-events-none fixed"
        onChange={(e) => {
          const val = e.target.value;
          if (val) {
            const lastChar = val.slice(-1);
            executePrintableChar(lastChar);
            e.target.value = '';
          }
        }}
      />

      {/* Authentic 1874 Press & Craft Cover / Intro Page */}
      {showCover && (
        <PressCraftCover
          onEnter={() => {
            setShowCover(false);
            focusTypewriter();
          }}
        />
      )}

      {/* Confirmation Dialog Modal */}
      <ConfirmationDialog
        isOpen={dialogConfig.isOpen}
        title={dialogConfig.title}
        message={dialogConfig.message}
        confirmLabel={dialogConfig.confirmLabel}
        confirmVariant={dialogConfig.confirmVariant}
        onConfirm={dialogConfig.action}
        onCancel={() => {
          setDialogConfig((d) => ({ ...d, isOpen: false }));
          focusTypewriter();
        }}
      />

      {/* Top Left Corner Floating Toolbar (Icon only, no boxes) - Visible on desktop/laptop, moved to bottom-right menu on mobile */}
      {!showCover && (
        <div
          id="top-left-floating-toolbar"
          className="fixed top-2.5 left-2.5 sm:top-4 sm:left-4 z-50 hidden sm:flex flex-col items-center gap-2 sm:gap-3 select-none no-print"
        >
          {/* 1. Settings Logo */}
          <button
            type="button"
            id="btn-settings-toggle"
            onClick={() => {
              setIsSettingsOpen((prev) => !prev);
            }}
            title={isSettingsOpen ? 'Close Settings' : 'Settings'}
            className="p-1 rounded-full text-[#8E8B82] hover:text-[#D8B365] transition-all duration-300 cursor-pointer bg-transparent border-none shadow-none outline-none"
          >
            <Settings
              className={`w-6 h-6 transition-all duration-300 ${
                isSettingsOpen ? 'rotate-90 text-[#D8B365]' : 'text-[#8E8B82] hover:text-[#E4DEC9]'
              }`}
            />
          </button>

          {/* 2. New Sheet Logo & Stored Sheets Archive Popover (Left Side Option) */}
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              id="btn-quick-new-sheet"
              onClick={() => {
                setIsSheetsMenuOpen((prev) => !prev);
                setIsSettingsOpen(false);
              }}
              title="New Sheet & Stored Sheets Archive"
              className="relative p-1 rounded-full text-[#8E8B82] hover:text-[#D8B365] transition-all duration-200 cursor-pointer bg-transparent border-none shadow-none outline-none"
            >
              <FilePlus
                className={`w-6 h-6 transition-colors ${
                  isSheetsMenuOpen ? 'text-[#D8B365]' : 'text-[#8E8B82] hover:text-[#E4DEC9]'
                }`}
              />
              {storedSheets.length > 0 && (
                <span
                  id="badge-stored-sheets-count"
                  className="absolute -top-1 -right-1 min-w-[17px] h-4 px-1 rounded-full bg-[#E63946] text-white text-[9px] font-bold font-courier flex items-center justify-center shadow-sm pointer-events-none"
                  title={`${storedSheets.length} completed sheets stored`}
                >
                  {storedSheets.length}
                </span>
              )}
            </button>
          </div>

          {/* 3. Download Button Logo (All Pages PDF) */}
          <button
            type="button"
            id="btn-quick-download"
            onClick={handleDownloadAllPdf}
            title="Download All Pages (PDF)"
            className="p-1 rounded-full text-[#8E8B82] hover:text-[#D8B365] transition-all duration-200 cursor-pointer bg-transparent border-none shadow-none outline-none"
          >
            <Download className="w-6 h-6 text-[#8E8B82] hover:text-[#E4DEC9] transition-colors" />
          </button>

          {/* 4. Clear Button Logo */}
          <button
            type="button"
            id="btn-quick-clear"
            onClick={() => {
              handleClearRequest();
              setIsSheetsMenuOpen(false);
            }}
            title="Clear Paper"
            className="p-1 rounded-full text-[#8E8B82] hover:text-[#E63946] transition-all duration-200 cursor-pointer bg-transparent border-none shadow-none outline-none"
          >
            <Trash2 className="w-6 h-6 text-[#8E8B82] hover:text-[#E63946] transition-colors" />
          </button>
        </div>
      )}

      {/* Stored Sheets Archive Popover (Where user checks all sheets - responsive for both desktop and mobile) */}
      {!showCover && isSheetsMenuOpen && (
        <div
          id="sheets-archive-popover"
          className="fixed bottom-16 right-3 sm:bottom-auto sm:right-auto sm:top-4 sm:left-14 z-50 bg-[#18191C] border border-[#2B2D33] rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.95)] p-2.5 w-[270px] sm:w-[250px] max-w-[calc(100vw-24px)] flex flex-col gap-2 font-courier text-xs select-none max-h-[75vh] sm:max-h-[85vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#2B2D33]">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#E4DEC9] font-bold">
                SHEET ARCHIVE
              </span>
              <p className="text-[10px] text-[#8E8B82]">
                Page {docState.pageNumber || 1} • {storedSheets.length} stored sheet{storedSheets.length === 1 ? '' : 's'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSheetsMenuOpen(false)}
              className="text-[#8E8B82] hover:text-white text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Active Sheet Status Card */}
          <div className="p-2.5 rounded-lg bg-[#22242A] border border-[#3E424D] flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#D8B365] uppercase tracking-wider">
                CURRENT SHEET • PAGE {docState.pageNumber || 1}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2D3039] text-[#A8ABB6] font-bold">
                TYPING
              </span>
            </div>
            <p className="text-white text-[11px] truncate font-medium">
              {docState.title || 'UNTITLED'}
            </p>
            <div className="flex items-center justify-between text-[10px] text-[#8E8B82] pt-0.5">
              <span>{docState.lines.filter((l) => l.trim().length > 0).length} / {A4_MAX_LINES} lines</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedSheetForView(null);
                  setIsExpandedModalOpen(true);
                  setIsSheetsMenuOpen(false);
                }}
                className="text-[#D8B365] hover:underline cursor-pointer"
              >
                View current
              </button>
            </div>
          </div>

          {/* Stored Previous Sheets Section */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[#8E8B82] font-bold">
                STORED PREVIOUS SHEETS ({storedSheets.length})
              </span>
            </div>

            {storedSheets.length === 0 ? (
              <div className="p-3 rounded-lg bg-[#141517] border border-[#25272E] text-center text-[#737169] text-[10px] leading-relaxed">
                No previous sheets stored yet. When your A4 page is completed and a new sheet is inserted, earlier pages are automatically saved here.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-[36vh] overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {storedSheets.map((sheet, index) => (
                  <div
                    key={sheet.id || `sheet-${index}`}
                    className="p-2.5 rounded-lg bg-[#1D1E22] border border-[#2B2D33] hover:border-[#40434C] transition-colors flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#E4DEC9] truncate">
                        {sheet.title || `SHEET ${index + 1}`}
                      </span>
                      <span className="text-[9px] text-[#737169]">
                        {sheet.lines.length} lines
                      </span>
                    </div>

                    {/* Stored Paper Sheet representation with page number in below right corner */}
                    <div className="p-2 rounded bg-[#FAF5E8] text-[#1E1B15] border border-[#DECFA8] font-typewriter text-[10px] relative flex flex-col justify-between shadow-xs">
                      <p className="line-clamp-2 text-[#221F1B] whitespace-pre-line text-[10px] leading-tight select-none">
                        {sheet.lines.filter((l) => l.trim().length > 0).slice(0, 2).join('\n') || sheet.title || '(Empty sheet)'}
                      </p>
                      <div className="flex items-center justify-end pt-1 select-none">
                        <span className="font-courier text-[10px] text-[#524B36] font-bold tracking-wider">
                          {sheet.pageNumber}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-1 border-t border-[#2B2D33]/60">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSheetForView(sheet);
                          setIsExpandedModalOpen(true);
                          setIsSheetsMenuOpen(false);
                        }}
                        className="text-[10px] text-[#D8B365] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Read sheet</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleLoadStoredSheet(sheet);
                          setIsSheetsMenuOpen(false);
                        }}
                        className="text-[10px] text-[#8E8B82] hover:text-white hover:underline cursor-pointer"
                      >
                        Edit sheet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Controls: Clear Archive */}
          {storedSheets.length > 0 && (
            <div className="pt-2 border-t border-[#2B2D33] flex items-center justify-end text-[10px]">
              <button
                type="button"
                onClick={handleClearStoredSheetsRequest}
                className="text-[#E63946] hover:underline cursor-pointer"
              >
                Clear archive
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Bottom Right Three-line Menu (Contains Settings, Sheet, Download, Clear for mobile devices) */}
      {!showCover && (
        <div
          id="mobile-bottom-right-menu-container"
          className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 sm:hidden select-none no-print"
        >
          {/* Three-line Menu Button */}
          <button
            type="button"
            id="btn-mobile-menu-toggle"
            onClick={() => {
              setIsMobileMenuOpen((prev) => !prev);
              setIsSheetsMenuOpen(false);
            }}
            aria-label="Open menu"
            title="Typewriter Options"
            className="relative p-2.5 rounded-full bg-[#18191C]/90 text-[#8E8B82] hover:text-[#D8B365] active:scale-95 border border-[#2B2D33] shadow-[0_4px_16px_rgba(0,0,0,0.7)] backdrop-blur-xs transition-all duration-200 cursor-pointer outline-none flex items-center justify-center"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-[#D8B365]" />
            ) : (
              <Menu className="w-6 h-6 text-[#E4DEC9]" />
            )}
            {/* Badge for stored sheets count when menu is closed */}
            {!isMobileMenuOpen && storedSheets.length > 0 && (
              <span
                id="badge-mobile-sheets-count"
                className="absolute -top-1 -right-1 min-w-[17px] h-4 px-1 rounded-full bg-[#E63946] text-white text-[9px] font-bold font-courier flex items-center justify-center shadow-sm pointer-events-none"
              >
                {storedSheets.length}
              </span>
            )}
          </button>

          {/* Mobile Popup Menu with all 4 options: Setting, Sheet, Download, Clear */}
          {isMobileMenuOpen && (
            <div
              id="mobile-options-menu-popup"
              className="absolute bottom-13 right-0 z-50 bg-[#18191C] border border-[#2B2D33] rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.95)] p-2 w-[190px] flex flex-col gap-1 font-courier text-xs select-none backdrop-blur-md"
            >
              {/* 1. Setting */}
              <button
                type="button"
                id="btn-mobile-menu-setting"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSettingsOpen((prev) => !prev);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-[#E4DEC9] hover:text-white hover:bg-[#25272E] active:bg-[#2A2C34] transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-[#D8B365] shrink-0" />
                <span className="font-medium tracking-wide">Settings</span>
              </button>

              {/* 2. Sheet */}
              <button
                type="button"
                id="btn-mobile-menu-sheet"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSheetsMenuOpen(true);
                  setIsSettingsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-[#E4DEC9] hover:text-white hover:bg-[#25272E] active:bg-[#2A2C34] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FilePlus className="w-4 h-4 text-[#D8B365] shrink-0" />
                  <span className="font-medium tracking-wide">Sheet</span>
                </div>
                {storedSheets.length > 0 && (
                  <span className="min-w-[17px] h-4 px-1 rounded-full bg-[#E63946] text-white text-[9px] font-bold font-courier flex items-center justify-center shadow-xs">
                    {storedSheets.length}
                  </span>
                )}
              </button>

              {/* 3. Download */}
              <button
                type="button"
                id="btn-mobile-menu-download"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleDownloadAllPdf();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-[#E4DEC9] hover:text-white hover:bg-[#25272E] active:bg-[#2A2C34] transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#D8B365] shrink-0" />
                <span className="font-medium tracking-wide">Download</span>
              </button>

              {/* 4. Clear */}
              <button
                type="button"
                id="btn-mobile-menu-clear"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleClearRequest();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-[#E63946] hover:text-[#FF6B6B] hover:bg-[#2A1E20] active:bg-[#341F22] transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-[#E63946] shrink-0" />
                <span className="font-medium tracking-wide">Clear</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Dismiss backdrop when mobile menu is open */}
      {!showCover && isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 sm:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Bottom Left Corner "i" Button (Icon only, opens vintage cream history page) */}
      {!showCover && (
        <button
          type="button"
          id="btn-info-toggle"
          onClick={() => setIsAboutOpen(true)}
          title="About TYPEWRIGHT (1874 Legacy & How It Works)"
          className="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-50 p-1 rounded-full text-[#8E8B82] hover:text-[#D8B365] transition-all duration-300 cursor-pointer select-none bg-transparent border-none shadow-none outline-none no-print"
        >
          <Info className="w-6 h-6 transition-colors text-[#8E8B82] hover:text-[#E4DEC9]" />
        </button>
      )}

      {/* Old Style Cream Color Historical & How It Works Page Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Expanded Torn Paper Sheet Modal with PDF Print Download */}
      <ExpandedPaperModal
        isOpen={isExpandedModalOpen}
        onClose={() => {
          setIsExpandedModalOpen(false);
          setSelectedSheetForView(null);
          focusTypewriter();
        }}
        title={selectedSheetForView ? selectedSheetForView.title : docState.title}
        lines={selectedSheetForView ? selectedSheetForView.lines : docState.lines}
        lineSpacing={docState.lineSpacing}
        pageNumber={selectedSheetForView ? selectedSheetForView.pageNumber : (docState.pageNumber || 1)}
      />

      {/* Dismiss backdrop when sheets menu is open */}
      {isSheetsMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => {
            setIsSheetsMenuOpen(false);
          }}
        />
      )}

      {/* Dim overlay when settings panel is open */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] transition-opacity"
          onClick={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Main Digital Mechanical Typewriter Hero Machine */}
      <main className="w-full flex-1 flex flex-col items-center justify-center relative max-w-7xl mx-auto px-0.5 min-[360px]:px-1 sm:px-2">
        <TypewriterMachine
          lines={docState.lines}
          cursorRow={docState.cursorRow}
          cursorCol={docState.cursorCol}
          margins={docState.margins}
          lineSpacing={docState.lineSpacing}
          onChangeLineSpacing={(spacing) => {
            setDocState((prev) => ({ ...prev, lineSpacing: spacing }));
            if (docState.soundEnabled) {
              playTypewriterSound('platen', 0.55);
            }
          }}
          mode={docState.mode}
          title={docState.title}
          onTitleChange={(title) => setDocState((prev) => ({ ...prev, title }))}
          pressedKeys={pressedKeys}
          isCapsLockActive={isCapsLockActive}
          isShiftActive={isShiftActive}
          isMarginReleased={isMarginReleased}
          isHammerStriking={isHammerStriking}
          isFeeding={isFeeding}
          isTearing={isTearing}
          isInsertingSheet={isInsertingSheet}
          isPageComplete={isPageComplete}
          pageNumber={docState.pageNumber || 1}
          a4MaxLines={A4_MAX_LINES}
          developerCredits={developerCredits}
          onKeyPress={handleKeyPress}
          onCarriageReturn={executeCarriageReturn}
          onMarginRelease={handleMarginRelease}
          onFeed={feedPaper}
          onPaperClick={handlePaperClick}
          onTearPaper={handleTearPaper}
          onInsertNewSheet={handleInsertNewSheet}
          isCarriageReturning={isCarriageReturning}
        />

        {/* Compact Typewriter Control Bar (Controlled via Top-Left Settings Button) */}
        <Controls
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          mode={docState.mode}
          onToggleMode={() =>
            setDocState((prev) => ({
              ...prev,
              mode: prev.mode === 'mechanical' ? 'free' : 'mechanical',
            }))
          }
          soundEnabled={docState.soundEnabled}
          onToggleSound={() =>
            setDocState((prev) => ({
              ...prev,
              soundEnabled: !prev.soundEnabled,
            }))
          }
          lineSpacing={docState.lineSpacing}
          onChangeLineSpacing={(spacing: LineSpacing) =>
            setDocState((prev) => ({ ...prev, lineSpacing: spacing }))
          }
          margins={docState.margins}
          onChangeMargins={(margins: MarginSettings) =>
            setDocState((prev) => ({ ...prev, margins }))
          }
          onNewSheet={handleNewSheetRequest}
          onClear={handleClearRequest}
          onDownloadTxt={handleDownloadTxt}
          onPrint={handlePrint}
          onReset={handleResetRequest}
        />
      </main>
    </div>
  );
}

