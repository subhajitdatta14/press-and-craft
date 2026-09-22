import React, { useState } from 'react';
import { PressCraftCover } from './PressCraftCover';
import { initOrUnlockAudio } from '../utils/audio';

interface StartupIntroProps {
  onComplete?: () => void;
}

export const StartupIntro: React.FC<StartupIntroProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    initOrUnlockAudio();
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 450);
  };

  if (!isVisible) return null;

  return (
    <div
      id="startup-intro-container"
      className={`fixed inset-0 z-50 transition-opacity duration-500 ease-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <PressCraftCover onEnter={handleEnter} />
    </div>
  );
};
