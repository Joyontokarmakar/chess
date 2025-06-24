import React, { useState, useEffect } from 'react';
import { Theme } from '../types';

interface RenamePlayerModalProps {
  isOpen: boolean;
  currentName: string;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
  theme: Theme;
}

const RenamePlayerModal: React.FC<RenamePlayerModalProps> = ({
  isOpen,
  currentName,
  onConfirm,
  onCancel,
  theme,
}) => {
  const [newName, setNewName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
    }
  }, [isOpen, currentName]);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    if (newName.trim()) {
      onConfirm(newName.trim());
    }
  };

  const modalBgClass = theme === 'dark' ? 'bg-slate-700/60 backdrop-blur-2xl border-slate-600/50' : 'bg-white/70 backdrop-blur-2xl border-gray-300/50';
  const titleColorClass = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const labelColorClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const inputClasses = `w-full p-3 rounded-lg border outline-none shadow-inner transition-all duration-200 ease-in-out backdrop-blur-sm text-base ${
    theme === 'dark' 
      ? 'bg-slate-800/70 border-slate-600/80 placeholder-slate-400/70 text-slate-100 focus:ring-1 focus:ring-sky-400 focus:border-sky-400' 
      : 'bg-gray-50/80 border-gray-400/80 placeholder-gray-500 text-slate-800 focus:ring-1 focus:ring-sky-500 focus:border-sky-500'
  }`;
  const overlayBgClass = theme === 'dark' ? 'bg-black/80 backdrop-blur-xl' : 'bg-black/60 backdrop-blur-lg';
  
  const buttonBaseClasses = `w-full sm:w-auto font-semibold py-2.5 px-5 rounded-lg text-base shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 min-w-[120px]`;
  
  const saveButtonThemeClass = theme === 'dark' 
    ? `bg-gradient-to-r from-green-500/90 via-emerald-600/90 to-teal-600/90 hover:from-green-500/95 hover:via-emerald-600/95 hover:to-teal-600/95 text-white focus-visible:ring-emerald-400 shadow-emerald-500/30 hover:shadow-emerald-500/40`
    : `bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 hover:from-green-600 hover:via-emerald-700 hover:to-teal-700 text-white focus-visible:ring-emerald-400 shadow-emerald-600/30 hover:shadow-emerald-600/40`;
  
  const cancelButtonThemeClass = theme === 'dark'
    ? `bg-slate-600/80 hover:bg-slate-500/90 text-slate-200 border border-slate-500/70 focus-visible:ring-slate-400`
    : `bg-gray-300/90 hover:bg-gray-400/95 text-slate-700 border border-gray-400/70 focus-visible:ring-gray-500`;

  return (
    <div className={`fixed inset-0 ${overlayBgClass} flex items-center justify-center z-[65] p-4`} onClick={onCancel}>
      <div 
        className={`w-full max-w-sm p-6 sm:p-7 rounded-xl shadow-2xl ${modalBgClass} flex flex-col items-center text-center`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`text-xl sm:text-2xl font-bold mb-5 ${titleColorClass}`}>
          Rename Player
        </h2>
        <div className="w-full mb-6">
            <label htmlFor="newPlayerName" className={`block text-sm font-medium mb-1.5 text-left ${labelColorClass}`}>
                New Name for {currentName}:
            </label>
            <input
                type="text"
                id="newPlayerName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={inputClasses}
                maxLength={20}
                autoFocus
            />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <button
            onClick={handleConfirm}
            className={`${buttonBaseClasses} ${saveButtonThemeClass}`}
            disabled={!newName.trim()}
            aria-label="Save new name"
          >
            Save Name
          </button>
          <button
            onClick={onCancel}
            className={`${buttonBaseClasses} ${cancelButtonThemeClass}`}
            aria-label="Cancel rename"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenamePlayerModal;