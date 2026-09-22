import { KeyDefinition } from '../types';

export const KEYBOARD_ROWS: KeyDefinition[][] = [
  // Row 1: Numbers & Symbols
  [
    { code: 'Digit1', char: '1', shiftChar: '!', display: '1', shiftDisplay: '!' },
    { code: 'Digit2', char: '2', shiftChar: '@', display: '2', shiftDisplay: '@' },
    { code: 'Digit3', char: '3', shiftChar: '#', display: '3', shiftDisplay: '#' },
    { code: 'Digit4', char: '4', shiftChar: '$', display: '4', shiftDisplay: '$' },
    { code: 'Digit5', char: '5', shiftChar: '%', display: '5', shiftDisplay: '%' },
    { code: 'Digit6', char: '6', shiftChar: '^', display: '6', shiftDisplay: '^' },
    { code: 'Digit7', char: '7', shiftChar: '&', display: '7', shiftDisplay: '&' },
    { code: 'Digit8', char: '8', shiftChar: '*', display: '8', shiftDisplay: '*' },
    { code: 'Digit9', char: '9', shiftChar: '(', display: '9', shiftDisplay: '(' },
    { code: 'Digit0', char: '0', shiftChar: ')', display: '0', shiftDisplay: ')' },
    { code: 'Minus', char: '-', shiftChar: '_', display: '-', shiftDisplay: '_' },
    { code: 'Equal', char: '=', shiftChar: '+', display: '=', shiftDisplay: '+' },
    { code: 'Backspace', display: 'BACK', width: 'w-7 min-[360px]:w-9 sm:w-16', isAction: true },
  ],

  // Row 2: QWERTY
  [
    { code: 'Tab', display: 'TAB', width: 'w-6 min-[360px]:w-8 sm:w-14', isAction: true },
    { code: 'KeyQ', char: 'q', shiftChar: 'Q', display: 'Q' },
    { code: 'KeyW', char: 'w', shiftChar: 'W', display: 'W' },
    { code: 'KeyE', char: 'e', shiftChar: 'E', display: 'E' },
    { code: 'KeyR', char: 'r', shiftChar: 'R', display: 'R' },
    { code: 'KeyT', char: 't', shiftChar: 'T', display: 'T' },
    { code: 'KeyY', char: 'y', shiftChar: 'Y', display: 'Y' },
    { code: 'KeyU', char: 'u', shiftChar: 'U', display: 'U' },
    { code: 'KeyI', char: 'i', shiftChar: 'I', display: 'I' },
    { code: 'KeyO', char: 'o', shiftChar: 'O', display: 'O' },
    { code: 'KeyP', char: 'p', shiftChar: 'P', display: 'P' },
    { code: 'BracketLeft', char: '[', shiftChar: '{', display: '[', shiftDisplay: '{' },
    { code: 'BracketRight', char: ']', shiftChar: '}', display: ']', shiftDisplay: '}' },
  ],

  // Row 3: ASDF
  [
    { code: 'CapsLock', display: 'CAPS', width: 'w-7 min-[360px]:w-9 sm:w-16', isModifier: true, isAction: true },
    { code: 'KeyA', char: 'a', shiftChar: 'A', display: 'A' },
    { code: 'KeyS', char: 's', shiftChar: 'S', display: 'S' },
    { code: 'KeyD', char: 'd', shiftChar: 'D', display: 'D' },
    { code: 'KeyF', char: 'f', shiftChar: 'F', display: 'F' },
    { code: 'KeyG', char: 'g', shiftChar: 'G', display: 'G' },
    { code: 'KeyH', char: 'h', shiftChar: 'H', display: 'H' },
    { code: 'KeyJ', char: 'j', shiftChar: 'J', display: 'J' },
    { code: 'KeyK', char: 'k', shiftChar: 'K', display: 'K' },
    { code: 'KeyL', char: 'l', shiftChar: 'L', display: 'L' },
    { code: 'Semicolon', char: ';', shiftChar: ':', display: ';', shiftDisplay: ':' },
    { code: 'Quote', char: "'", shiftChar: '"', display: "'", shiftDisplay: '"' },
    { code: 'Enter', display: 'RETURN', width: 'w-9 min-[360px]:w-11 sm:w-20', isAction: true },
  ],

  // Row 4: ZXCV
  [
    { code: 'ShiftLeft', display: 'SHIFT', width: 'w-7 min-[360px]:w-9 sm:w-18', isModifier: true, isAction: true },
    { code: 'KeyZ', char: 'z', shiftChar: 'Z', display: 'Z' },
    { code: 'KeyX', char: 'x', shiftChar: 'X', display: 'X' },
    { code: 'KeyC', char: 'c', shiftChar: 'C', display: 'C' },
    { code: 'KeyV', char: 'v', shiftChar: 'V', display: 'V' },
    { code: 'KeyB', char: 'b', shiftChar: 'B', display: 'B' },
    { code: 'KeyN', char: 'n', shiftChar: 'N', display: 'N' },
    { code: 'KeyM', char: 'm', shiftChar: 'M', display: 'M' },
    { code: 'Comma', char: ',', shiftChar: '<', display: ',', shiftDisplay: '<' },
    { code: 'Period', char: '.', shiftChar: '>', display: '.', shiftDisplay: '>' },
    { code: 'Slash', char: '/', shiftChar: '?', display: '/', shiftDisplay: '?' },
    { code: 'ShiftRight', display: 'SHIFT', width: 'w-7 min-[360px]:w-9 sm:w-18', isModifier: true, isAction: true },
  ],
];
