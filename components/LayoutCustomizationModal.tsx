
import React, { useState, useEffect } from 'react';
import { Theme, LayoutSettings, BoardStyleId, Piece, PieceType, PlayerColor } from '../types';
import { BOARD_STYLE_CONFIG } from '../constants';
import PieceDisplay from './PieceDisplay'; 
import { getPieceIconColor } from '../utils/styleUtils';


interface LayoutCustomizationModalProps {
  isOpen: boolean;
  currentSettings: LayoutSettings;
  onApplySettings: (newSettings: LayoutSettings) => void;
  onClose: () => void;
  theme: Theme;
}

// Helper to format IDs into user-friendly labels
function formatOptionLabel(id: string): string {
  let label = id.replace(/-/g, ' ');
  return label
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const CURATED_BOARD_STYLES: { id: BoardStyleId; label: string }[] = [
  { id: 'default-dark', label: 'Default Dark' },
  { id: 'default-light', label: 'Default Light' },
  { id: 'classic-wood', label: 'Classic Wood' },
  { id: 'cool-blue', label: 'Cool Blue' },
  { id: 'forest-green', label: 'Forest Green' },
];

interface ColorOption {
  id: string; 
  label: string;
  value: string; // Hex color string
}

// Sober piece color options
const WHITE_PIECE_COLOR_OPTIONS: ColorOption[] = [
  { id: 'default-white-dark-theme', label: 'Default (Dark Theme)', value: '#D1D5DB' }, // gray-300 (new default)
  { id: 'default-white-light-theme', label: 'Default (Light Theme)', value: '#F3F4F6' }, // gray-100 (new default)
  { id: 'classic-ivory', label: 'Ivory', value: '#F5F5DC' },
  { id: 'silver-mist', label: 'Silver Mist', value: '#C0C0C0' },
  { id: 'light-slate', label: 'Light Slate', value: '#B0C4DE' }, // Was sky-blue
  { id: 'pale-gold', label: 'Pale Gold', value: '#E6BE8A' },   // Was golden-sand
];

const BLACK_PIECE_COLOR_OPTIONS: ColorOption[] = [
  { id: 'default-black-dark-theme', label: 'Default (Dark Theme)', value: '#4B5563' }, // gray-600 (new default)
  { id: 'default-black-light-theme', label: 'Default (Light Theme)', value: '#374151' }, // gray-700 (new default)
  { id: 'classic-ebony', label: 'Ebony', value: '#555D50' },
  { id: 'charcoal-gray', label: 'Charcoal', value: '#36454F' },
  { id: 'dark-slate-blue', label: 'Dark Slate Blue', value: '#483D8B' }, // Was deep-ocean
  { id: 'olive-drab', label: 'Olive Drab', value: '#6B8E23' },      // Was forest-shadow
];


const extractBgClass = (classes: string | undefined): string => {
  if (!classes) return 'bg-transparent';
  const bgRegex = /\b(bg-([a-zA-Z0-9-]+)(-\d+)?(\/\d+)?)\b/;
  const match = classes.match(bgRegex);
  return match ? match[1] : 'bg-transparent'; 
};


const LayoutCustomizationModal: React.FC<LayoutCustomizationModalProps> = ({
  isOpen,
  currentSettings,
  onApplySettings,
  onClose,
  theme,
}) => {
  const [selectedBoardStyle, setSelectedBoardStyle] = useState<BoardStyleId>(currentSettings.boardStyleId);
  const [selectedWhitePieceColor, setSelectedWhitePieceColor] = useState<string | undefined>(currentSettings.whitePieceColor);
  const [selectedBlackPieceColor, setSelectedBlackPieceColor] = useState<string | undefined>(currentSettings.blackPieceColor);

  useEffect(() => {
    if (isOpen) {
      setSelectedBoardStyle(currentSettings.boardStyleId);
      setSelectedWhitePieceColor(currentSettings.whitePieceColor);
      setSelectedBlackPieceColor(currentSettings.blackPieceColor);
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) {
    return null;
  }

  const handleApply = () => {
    onApplySettings({
      ...currentSettings, // Preserve existing settings like isSoundEnabled, showResignButton, showGameToasts
      boardStyleId: selectedBoardStyle,
      whitePieceColor: selectedWhitePieceColor,
      blackPieceColor: selectedBlackPieceColor,
    });
  };

  const modalBgClass = theme === 'dark' ? 'bg-slate-700/60 backdrop-blur-2xl border-slate-600/50' : 'bg-white/70 backdrop-blur-2xl border-gray-300/50';
  const titleColorClass = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const labelColorClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const sectionTitleColorClass = theme === 'dark' ? 'text-sky-300' : 'text-sky-700';
  
  const radioClasses = `w-4 h-4 border-2 rounded-full cursor-pointer transition-all duration-150 focus:ring-2 focus:ring-offset-2 ${
    theme === 'dark' ? 'border-slate-500 bg-slate-700 focus:ring-sky-400 focus:ring-offset-slate-700 accent-sky-400' 
                     : 'border-gray-400 bg-gray-100 focus:ring-sky-500 focus:ring-offset-white accent-sky-500'
  }`;
    
  const buttonBase = `w-full sm:w-auto font-semibold py-3 px-6 rounded-lg text-base shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75`;
  const applyButtonClass = `${buttonBase} ${theme === 'dark' ? 'bg-gradient-to-r from-green-500/90 via-emerald-600/90 to-teal-600/90 hover:from-green-500/95 hover:via-emerald-600/95 hover:to-teal-600/95 text-white focus-visible:ring-emerald-400 shadow-emerald-500/30 hover:shadow-emerald-500/40' : 'bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 hover:from-green-600 hover:via-emerald-700 hover:to-teal-700 text-white focus-visible:ring-emerald-400 shadow-emerald-600/30 hover:shadow-emerald-600/40'}`;
  const cancelButtonClass = `${buttonBase} ${theme === 'dark' ? 'bg-slate-600/80 hover:bg-slate-500/90 text-slate-200 border border-slate-500/70 focus-visible:ring-slate-400' : 'bg-gray-300/90 hover:bg-gray-400/95 text-slate-700 border border-gray-400/70 focus-visible:ring-gray-500'}`;
  const overlayBgClass = theme === 'dark' ? 'bg-black/80 backdrop-blur-xl' : 'bg-black/60 backdrop-blur-lg';
  const hrClass = `my-3 sm:my-4 ${theme === 'dark' ? 'border-slate-600/50' : 'border-gray-300/50'}`;

  const kingPieceWhite: Piece = { id: 'preview-white-king', type: PieceType.KING, color: PlayerColor.WHITE, hasMoved: false };
  const kingPieceBlack: Piece = { id: 'preview-black-king', type: PieceType.KING, color: PlayerColor.BLACK, hasMoved: false };


  return (
    <div className={`fixed inset-0 ${overlayBgClass} flex items-center justify-center z-[60] p-4`} onClick={onClose}>
      <div 
        className={`w-full max-w-lg p-5 sm:p-7 rounded-xl shadow-2xl ${modalBgClass} ${titleColorClass} flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5 sm:mb-7">
            <h2 className={`text-xl sm:text-2xl font-bold ${titleColorClass}`} style={{ textShadow: theme === 'dark' ? '0 0 10px rgba(180,180,255,0.2)' : '0 0 8px rgba(0,0,0,0.1)'}}>
                Customize Appearance
            </h2>
            <button
                onClick={onClose}
                className={`p-2 rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/70 focus-visible:ring-sky-400' : 'text-slate-500 hover:text-slate-800 hover:bg-gray-300/70 focus-visible:ring-sky-600' }`}
                aria-label="Close customization"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className={`flex-grow overflow-y-auto space-y-5 sm:space-y-6 pr-2 -mr-2 scrollbar-thin scrollbar-thumb-rounded-full ${theme === 'dark' ? 'scrollbar-thumb-slate-600 scrollbar-track-slate-700/50' : 'scrollbar-thumb-gray-400 scrollbar-track-gray-200/50'}`}>
          {/* Board Style Selection */}
          <fieldset>
            <legend className={`text-md sm:text-lg font-semibold mb-2.5 ${sectionTitleColorClass}`}>Board Style</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5">
              {CURATED_BOARD_STYLES.map(style => {
                const boardThemeConfig = BOARD_STYLE_CONFIG[style.id]?.[theme] || BOARD_STYLE_CONFIG[style.id]?.light;
                const lightSquareBg = extractBgClass(boardThemeConfig?.lightSquare);
                const darkSquareBg = extractBgClass(boardThemeConfig?.darkSquare);
                const previewSwatchBorder = theme === 'dark' ? 'border-slate-500' : 'border-gray-400';

                return (
                    <label key={style.id} className={`flex items-center space-x-2.5 p-2 rounded-md cursor-pointer transition-colors ${theme === 'dark' ? 'hover:bg-slate-600/50' : 'hover:bg-gray-200/60'}`}>
                        <input
                            type="radio"
                            name="boardStyle"
                            value={style.id}
                            checked={selectedBoardStyle === style.id}
                            onChange={() => setSelectedBoardStyle(style.id)}
                            className={radioClasses}
                        />
                        <div className="flex items-center space-x-1">
                            <div className={`w-5 h-5 rounded-sm border ${previewSwatchBorder} ${lightSquareBg}`}></div>
                            <div className={`w-5 h-5 rounded-sm border ${previewSwatchBorder} ${darkSquareBg}`}></div>
                        </div>
                        <span className={`${labelColorClass} text-sm`}>{formatOptionLabel(style.id)}</span>
                    </label>
                );
              })}
            </div>
          </fieldset>

          <hr className={hrClass} />

          {/* White Piece Color Selection */}
          <fieldset>
            <div className="flex items-center justify-between mb-2.5">
                <legend className={`text-md sm:text-lg font-semibold ${sectionTitleColorClass}`}>White Piece Color</legend>
                <PieceDisplay 
                    piece={kingPieceWhite} 
                    size="24px" 
                    color={getPieceIconColor(PlayerColor.WHITE, theme, { ...currentSettings, boardStyleId: selectedBoardStyle, whitePieceColor: selectedWhitePieceColor })} 
                />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {WHITE_PIECE_COLOR_OPTIONS.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedWhitePieceColor(option.value)}
                  className={`p-2 rounded-md border-2 text-sm transition-all duration-150
                              ${selectedWhitePieceColor === option.value 
                                ? (theme === 'dark' ? 'border-sky-400 ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-700' : 'border-sky-500 ring-2 ring-sky-500 ring-offset-2 ring-offset-white')
                                : (theme === 'dark' ? 'border-slate-500 hover:border-slate-400' : 'border-gray-400 hover:border-gray-500')}
                              ${theme === 'dark' ? 'bg-slate-600/50 hover:bg-slate-500/60' : 'bg-gray-100/70 hover:bg-gray-200/80'}`}
                  aria-pressed={selectedWhitePieceColor === option.value}
                  title={option.label}
                >
                  <div className="flex items-center space-x-2">
                    <span style={{ backgroundColor: option.value }} className="w-4 h-4 rounded-full border border-gray-400/50"></span>
                    <span className={labelColorClass}>{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
             <button
                type="button"
                onClick={() => setSelectedWhitePieceColor(undefined)}
                className={`mt-2.5 text-xs py-1 px-3 rounded-md ${theme === 'dark' ? 'text-slate-400 hover:text-slate-300 bg-slate-600 hover:bg-slate-500' : 'text-slate-500 hover:text-slate-700 bg-gray-200 hover:bg-gray-300'}`}
             >
                Use Theme Default (Overall)
            </button>
          </fieldset>
          
          <hr className={hrClass} />

          {/* Black Piece Color Selection */}
          <fieldset>
            <div className="flex items-center justify-between mb-2.5">
                <legend className={`text-md sm:text-lg font-semibold ${sectionTitleColorClass}`}>Black Piece Color</legend>
                 <PieceDisplay 
                    piece={kingPieceBlack} 
                    size="24px" 
                    color={getPieceIconColor(PlayerColor.BLACK, theme, { ...currentSettings, boardStyleId: selectedBoardStyle, blackPieceColor: selectedBlackPieceColor })}
                />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {BLACK_PIECE_COLOR_OPTIONS.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedBlackPieceColor(option.value)}
                  className={`p-2 rounded-md border-2 text-sm transition-all duration-150
                              ${selectedBlackPieceColor === option.value 
                                ? (theme === 'dark' ? 'border-sky-400 ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-700' : 'border-sky-500 ring-2 ring-sky-500 ring-offset-2 ring-offset-white')
                                : (theme === 'dark' ? 'border-slate-500 hover:border-slate-400' : 'border-gray-400 hover:border-gray-500')}
                              ${theme === 'dark' ? 'bg-slate-600/50 hover:bg-slate-500/60' : 'bg-gray-100/70 hover:bg-gray-200/80'}`}
                  aria-pressed={selectedBlackPieceColor === option.value}
                  title={option.label}
                >
                  <div className="flex items-center space-x-2">
                    <span style={{ backgroundColor: option.value }} className="w-4 h-4 rounded-full border border-gray-400/50"></span>
                    <span className={labelColorClass}>{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
            <button
                type="button"
                onClick={() => setSelectedBlackPieceColor(undefined)}
                className={`mt-2.5 text-xs py-1 px-3 rounded-md ${theme === 'dark' ? 'text-slate-400 hover:text-slate-300 bg-slate-600 hover:bg-slate-500' : 'text-slate-500 hover:text-slate-700 bg-gray-200 hover:bg-gray-300'}`}
             >
                Use Theme Default (Overall)
            </button>
          </fieldset>
        </div>

        <div className="mt-6 sm:mt-8 pt-4 border-t flex flex-col sm:flex-row-reverse gap-3 sm:gap-4 ${theme === 'dark' ? 'border-slate-600/70' : 'border-gray-300/70'}">
          <button onClick={handleApply} className={applyButtonClass}>
            Apply Changes
          </button>
          <button onClick={onClose} className={cancelButtonClass}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LayoutCustomizationModal;
