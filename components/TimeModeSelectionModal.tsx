import React, { useState } from 'react';
import { Theme, TIME_OPTIONS, TimeOptionKey } from '../types';

interface TimeModeSelectionModalProps {
  isOpen: boolean;
  onClose: (selectedTimeInSeconds: number | null) => void;
  theme: Theme;
}

const TimeModeSelectionModal: React.FC<TimeModeSelectionModalProps> = ({ isOpen, onClose, theme }) => {
  const [step, setStep] = useState<'initial' | 'selectTime'>('initial');

  if (!isOpen) {
    return null;
  }

  const handleInitialSelection = (useTimer: boolean) => {
    if (useTimer) {
      setStep('selectTime');
    } else {
      onClose(null); // No timer selected
      setStep('initial'); // Reset for next open
    }
  };

  const handleTimeSelection = (timeKey: TimeOptionKey) => {
    onClose(TIME_OPTIONS[timeKey]);
    setStep('initial'); // Reset for next open
  };

  const modalBgClass = theme === 'dark' ? 'bg-slate-700/60 backdrop-blur-2xl border-slate-600/50' : 'bg-white/70 backdrop-blur-2xl border-gray-300/50';
  const titleColorClass = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const overlayBgClass = theme === 'dark' ? 'bg-black/80 backdrop-blur-xl' : 'bg-black/60 backdrop-blur-lg';
  
  const buttonBaseClasses = `w-full sm:w-auto font-semibold py-3.5 px-7 rounded-lg text-lg shadow-xl hover:shadow-2xl transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 min-w-[160px]`;
  
  const getButtonThemeClass = (type: 'primary' | 'secondary' | 'select') => {
    if (theme === 'dark') {
      if (type === 'primary') return `bg-gradient-to-r from-sky-500/90 via-blue-600/90 to-indigo-600/90 hover:from-sky-500/95 hover:via-blue-600/95 hover:to-indigo-600/95 text-white focus-visible:ring-blue-400 shadow-blue-500/30 hover:shadow-blue-500/40`;
      if (type === 'secondary') return `bg-slate-600/80 hover:bg-slate-500/90 text-slate-200 border border-slate-500/70 focus-visible:ring-slate-400`;
      if (type === 'select') return `bg-teal-600/70 hover:bg-teal-500/80 border-teal-500/50 text-white focus-visible:ring-teal-400`;
    } else { // Light theme
      if (type === 'primary') return `bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-700 text-white focus-visible:ring-blue-400 shadow-blue-600/30 hover:shadow-blue-600/40`;
      if (type === 'secondary') return `bg-gray-300/90 hover:bg-gray-400/95 text-slate-700 border border-gray-400/70 focus-visible:ring-gray-500`;
      if (type === 'select') return `bg-teal-500/80 hover:bg-teal-600/90 border-teal-400/60 text-white focus-visible:ring-teal-500`;
    }
    return '';
  };


  return (
    <div className={`fixed inset-0 ${overlayBgClass} flex items-center justify-center z-[55] p-4`} onClick={() => {/* Allow closing by specific button */}}>
      <div 
        className={`w-full max-w-md p-6 sm:p-8 rounded-xl shadow-2xl ${modalBgClass} ${titleColorClass} flex flex-col items-center`}
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'initial' && (
          <>
            <h2 className={`text-xl sm:text-2xl font-bold mb-6 text-center ${titleColorClass}`} style={{ textShadow: theme === 'dark' ? '0 0 10px rgba(180,180,255,0.2)' : '0 0 8px rgba(0,0,0,0.1)'}}>
              Play with a Timer?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button
                onClick={() => handleInitialSelection(true)}
                className={`${buttonBaseClasses} ${getButtonThemeClass('primary')}`}
                aria-label="Yes, use a timer"
              >
                Yes, Use Timer
              </button>
              <button
                onClick={() => handleInitialSelection(false)}
                className={`${buttonBaseClasses} ${getButtonThemeClass('secondary')}`}
                aria-label="No, play without a timer"
              >
                No Timer
              </button>
            </div>
          </>
        )}

        {step === 'selectTime' && (
          <>
            <h2 className={`text-xl sm:text-2xl font-bold mb-6 text-center ${titleColorClass}`} style={{ textShadow: theme === 'dark' ? '0 0 10px rgba(180,180,255,0.2)' : '0 0 8px rgba(0,0,0,0.1)'}}>
              Select Time Per Player
            </h2>
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              {(Object.keys(TIME_OPTIONS) as TimeOptionKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => handleTimeSelection(key)}
                  className={`${buttonBaseClasses} ${getButtonThemeClass('select')} text-base sm:text-lg`}
                  aria-label={`Select ${key}`}
                >
                  {key}
                </button>
              ))}
            </div>
            <button
                onClick={() => setStep('initial')}
                className={`${buttonBaseClasses} ${getButtonThemeClass('secondary')} mt-6 text-sm`}
                aria-label="Back to timer choice"
            >
                Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TimeModeSelectionModal;