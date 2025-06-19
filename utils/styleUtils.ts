import { Theme, PlayerColor } from '../types';
import { BOARD_STYLE_CONFIG, PIECE_COLOR_CONFIG } from '../constants';

export type BoardStyleId = keyof typeof BOARD_STYLE_CONFIG;
export type PieceColorOptionId = keyof typeof PIECE_COLOR_CONFIG;

export interface BoardStyleClasses {
  container: string;
  lightSquare: string;
  darkSquare: string;
  selectedSquareBg: string;
  selectedSquareRing: string;
  possibleMoveDot: string;
  possibleMoveRing: string;
}

export interface PieceStyleClasses {
  colorClass: string;
  // fontWeightClass might be part of the colorClass string itself from PIECE_COLOR_CONFIG
}

export function getBoardClasses(styleId: BoardStyleId, theme: Theme): BoardStyleClasses {
  const configForStyle = BOARD_STYLE_CONFIG[styleId];
  if (!configForStyle) {
    // Fallback to default dark if styleId is invalid
    console.warn(`Invalid boardStyleId: ${styleId}. Falling back to default-dark.`);
    return BOARD_STYLE_CONFIG['default-dark'][theme] || BOARD_STYLE_CONFIG['default-dark']['dark'];
  }
  return configForStyle[theme] || configForStyle.light; // Fallback to light if specific theme variant not found in config
}

export function getPieceClasses(
  colorOptionId: PieceColorOptionId, // e.g., 'white-classic-white' or 'black-fiery-red'
  playerColor: PlayerColor, // Used to construct the key if needed, or for default logic
  theme: Theme
): PieceStyleClasses {
  const themedStyle = PIECE_COLOR_CONFIG[colorOptionId];

  if (themedStyle) {
    return { colorClass: themedStyle[theme] || themedStyle.light };
  }

  // Fallback to theme defaults if custom option is 'theme-default' or invalid
  const defaultOptionId = playerColor === PlayerColor.WHITE ? 'white-theme-default' : 'black-theme-default';
  const defaultThemedStyle = PIECE_COLOR_CONFIG[defaultOptionId];
  
  if (defaultThemedStyle) {
    return { colorClass: defaultThemedStyle[theme] || defaultThemedStyle.light };
  }
  
  // Absolute fallback (should not happen with current config)
  return { colorClass: playerColor === PlayerColor.WHITE ? (theme === 'dark' ? 'text-rose-500 font-bold' : 'text-red-600 font-bold') : (theme === 'dark' ? 'text-cyan-400' : 'text-blue-600') };
}
