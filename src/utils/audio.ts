/**
 * TYPEWRIGHT Audio Engine
 * High-fidelity procedural Web Audio synthesis for mechanical typewriter soundscapes.
 * Features ultra-low latency, zero external asset dependencies, mobile-optimized audio pipeline,
 * and subtle organic mechanical variation.
 */

import { SoundEffect } from '../types';

let audioCtx: AudioContext | null = null;
let cachedNoiseBuffer: AudioBuffer | null = null;
let isAudioUnlocked = false;

/**
 * Initializes and unlocks the Web Audio Context for all browsers,
 * including iOS Safari, Chrome Mobile, and desktop browsers.
 */
export function initOrUnlockAudio(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      try {
        audioCtx = new AudioContextClass({ latencyHint: 'interactive' });
      } catch {
        audioCtx = new AudioContextClass();
      }
    }
  }

  if (audioCtx) {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    // Hardware unlock for mobile iOS / Android web audio policy
    if (!isAudioUnlocked) {
      try {
        const buffer = audioCtx.createBuffer(1, 1, 22050);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start(0);
        isAudioUnlocked = true;
      } catch {
        // Continue gracefully if browser restricts
      }
    }
  }

  return audioCtx;
}

// Auto-register touch & click unlock listeners for zero-latency mobile playback
if (typeof window !== 'undefined') {
  const unlockEvents = ['touchstart', 'touchend', 'pointerdown', 'keydown', 'click'];
  const handleFirstInteraction = () => {
    initOrUnlockAudio();
    unlockEvents.forEach((evt) => {
      window.removeEventListener(evt, handleFirstInteraction);
    });
  };
  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, handleFirstInteraction, { passive: true, capture: true });
  });
}

/**
 * Returns a shared, pre-allocated noise buffer for ultra-low latency playback
 * without incurring garbage collection or allocation overhead per keystroke.
 */
function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (!cachedNoiseBuffer || cachedNoiseBuffer.sampleRate !== ctx.sampleRate) {
    const duration = 0.8;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // White noise with exponential falloff
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.45));
    }
    cachedNoiseBuffer = buffer;
  }
  return cachedNoiseBuffer;
}

/**
 * Play a synthesized typewriter sound effect with immediate response on mobile and desktop
 */
export function playTypewriterSound(effect: SoundEffect, volume = 0.5): void {
  try {
    const ctx = initOrUnlockAudio();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), ctx.currentTime);
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;
    const noiseBuf = getNoiseBuffer(ctx);

    switch (effect) {
      case 'strike': {
        // 1. Transient click (metal type hammer striking ribbon & platen)
        // High & mid presence tuned for mobile phone speakers and headphones
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuf;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        // Organic frequency jitter between 2900Hz and 3500Hz
        noiseFilter.frequency.setValueAtTime(3200 + (Math.random() - 0.5) * 500, now);
        noiseFilter.Q.setValueAtTime(3.8, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(1.1, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);
        noise.start(now);
        noise.stop(now + 0.05);

        // 2. Punchy tactile snap (audible on small phone speakers at 900Hz - 1400Hz)
        const snap = ctx.createOscillator();
        snap.type = 'triangle';
        snap.frequency.setValueAtTime(1250, now);
        snap.frequency.exponentialRampToValueAtTime(280, now + 0.035);

        const snapGain = ctx.createGain();
        snapGain.gain.setValueAtTime(0.65, now);
        snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        snap.connect(snapGain);
        snapGain.connect(masterGain);
        snap.start(now);
        snap.stop(now + 0.04);

        // 3. Body thud (cast metal chassis resonance)
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        const baseFreq = 180 + (Math.random() - 0.5) * 20;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.07);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.7, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.08);

        // 4. Escapement ratchet click
        const ratchet = ctx.createOscillator();
        ratchet.type = 'sine';
        ratchet.frequency.setValueAtTime(980 + (Math.random() - 0.5) * 80, now + 0.015);
        const ratchetGain = ctx.createGain();
        ratchetGain.gain.setValueAtTime(0.0, now);
        ratchetGain.gain.setValueAtTime(0.3, now + 0.015);
        ratchetGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        ratchet.connect(ratchetGain);
        ratchetGain.connect(masterGain);
        ratchet.start(now + 0.015);
        ratchet.stop(now + 0.06);
        break;
      }

      case 'space': {
        // Softer, hollow wooden/rubber space bar clack
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuf;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1400, now);
        noiseFilter.Q.setValueAtTime(2.2, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.75, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);
        noise.start(now);
        noise.stop(now + 0.055);

        // Midrange knock for phone speakers
        const midKnock = ctx.createOscillator();
        midKnock.type = 'sine';
        midKnock.frequency.setValueAtTime(520, now);
        midKnock.frequency.exponentialRampToValueAtTime(90, now + 0.05);
        const midGain = ctx.createGain();
        midGain.gain.setValueAtTime(0.6, now);
        midGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        midKnock.connect(midGain);
        midGain.connect(masterGain);
        midKnock.start(now);
        midKnock.stop(now + 0.06);

        // Low end bar thud
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.07);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.55, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.07);
        break;
      }

      case 'backspace': {
        // Sharp backward mechanical escapement clack
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuf;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(2400, now);
        noiseFilter.Q.setValueAtTime(3.0, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.85, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);
        noise.start(now);
        noise.stop(now + 0.045);

        // Secondary latch click
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.05);

        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(0.5, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }

      case 'return': {
        // Carriage return: sweeping mechanical ratchet slide + heavy stop clunk
        // Part 1: Rapid ratcheting clicks (platen roll & carriage slide)
        for (let i = 0; i < 6; i++) {
          const clickTime = now + i * 0.035;
          const clickNoise = ctx.createBufferSource();
          clickNoise.buffer = noiseBuf;

          const clickFilter = ctx.createBiquadFilter();
          clickFilter.type = 'bandpass';
          clickFilter.frequency.setValueAtTime(2600 - i * 140, clickTime);

          const clickGain = ctx.createGain();
          clickGain.gain.setValueAtTime(0.4 + i * 0.03, clickTime);
          clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.02);

          clickNoise.connect(clickFilter);
          clickFilter.connect(clickGain);
          clickGain.connect(masterGain);

          clickNoise.start(clickTime);
          clickNoise.stop(clickTime + 0.025);
        }

        // Part 2: Solid metallic carriage margin stop thump
        const stopTime = now + 0.22;
        const stopOsc = ctx.createOscillator();
        stopOsc.type = 'triangle';
        stopOsc.frequency.setValueAtTime(240, stopTime);
        stopOsc.frequency.exponentialRampToValueAtTime(45, stopTime + 0.12);

        const stopGain = ctx.createGain();
        stopGain.gain.setValueAtTime(0.95, stopTime);
        stopGain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.12);

        stopOsc.connect(stopGain);
        stopGain.connect(masterGain);
        stopOsc.start(stopTime);
        stopOsc.stop(stopTime + 0.14);

        const stopNoise = ctx.createBufferSource();
        stopNoise.buffer = noiseBuf;
        const stopFilter = ctx.createBiquadFilter();
        stopFilter.type = 'highpass';
        stopFilter.frequency.setValueAtTime(1400, stopTime);

        const stopNoiseGain = ctx.createGain();
        stopNoiseGain.gain.setValueAtTime(0.65, stopTime);
        stopNoiseGain.gain.exponentialRampToValueAtTime(0.001, stopTime + 0.06);

        stopNoise.connect(stopFilter);
        stopFilter.connect(stopNoiseGain);
        stopNoiseGain.connect(masterGain);
        stopNoise.start(stopTime);
        stopNoise.stop(stopTime + 0.07);
        break;
      }

      case 'bell': {
        // High-purity vintage brass bell chime ("DING!")
        // Fundamental tone (~2093Hz - C7) + Harmonics
        const bellFreq = 2093;
        const bellDuration = 1.3;

        // Primary chime
        const bell1 = ctx.createOscillator();
        bell1.type = 'sine';
        bell1.frequency.setValueAtTime(bellFreq, now);

        const bellGain1 = ctx.createGain();
        bellGain1.gain.setValueAtTime(0.85, now);
        bellGain1.gain.exponentialRampToValueAtTime(0.001, now + bellDuration);

        bell1.connect(bellGain1);
        bellGain1.connect(masterGain);
        bell1.start(now);
        bell1.stop(now + bellDuration);

        // Harmonic overtone 1 (~4186Hz)
        const bell2 = ctx.createOscillator();
        bell2.type = 'sine';
        bell2.frequency.setValueAtTime(bellFreq * 2.02, now);

        const bellGain2 = ctx.createGain();
        bellGain2.gain.setValueAtTime(0.45, now);
        bellGain2.gain.exponentialRampToValueAtTime(0.001, now + bellDuration * 0.7);

        bell2.connect(bellGain2);
        bellGain2.connect(masterGain);
        bell2.start(now);
        bell2.stop(now + bellDuration * 0.7);

        // Strike hammer ping
        const pingNoise = ctx.createBufferSource();
        pingNoise.buffer = noiseBuf;
        const pingFilter = ctx.createBiquadFilter();
        pingFilter.type = 'bandpass';
        pingFilter.frequency.setValueAtTime(4500, now);
        pingFilter.Q.setValueAtTime(8, now);

        const pingGain = ctx.createGain();
        pingGain.gain.setValueAtTime(0.55, now);
        pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        pingNoise.connect(pingFilter);
        pingFilter.connect(pingGain);
        pingGain.connect(masterGain);
        pingNoise.start(now);
        pingNoise.stop(now + 0.03);
        break;
      }

      case 'platen': {
        // Platen roller detent click (line feed knob turned / paper feed)
        // Tuned to cut through clearly on mobile speakers (850Hz -> 200Hz)
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(850, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.04);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.045);

        // Subtle mechanical detent friction noise
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2200, now);
        filter.Q.setValueAtTime(3.5, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.35, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(masterGain);
        noise.start(now);
        noise.stop(now + 0.035);
        break;
      }

      case 'shift': {
        // Heavy carriage shift metal clunk with distinct mechanical click
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.06);

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuf;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2600, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(masterGain);
        noise.start(now);
        noise.stop(now + 0.03);
        break;
      }

      case 'tear': {
        // High-frequency textured paper ripping / tearing sound
        const tearDuration = 0.38;
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuf;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.linearRampToValueAtTime(2800, now + 0.15);
        filter.frequency.linearRampToValueAtTime(900, now + tearDuration);
        filter.Q.setValueAtTime(1.8, now);

        const tearGain = ctx.createGain();
        tearGain.gain.setValueAtTime(0.01, now);
        tearGain.gain.linearRampToValueAtTime(0.75, now + 0.04);
        tearGain.gain.setValueAtTime(0.7, now + 0.2);
        tearGain.gain.exponentialRampToValueAtTime(0.001, now + tearDuration);

        noise.connect(filter);
        filter.connect(tearGain);
        tearGain.connect(masterGain);
        noise.start(now);
        noise.stop(now + tearDuration + 0.02);
        break;
      }
    }
  } catch (err) {
    // Gracefully ignore audio failures (e.g. strict browser security policies)
    console.warn('Typewriter audio error:', err);
  }
}
