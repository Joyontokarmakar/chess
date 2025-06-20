import { PlayerColor, Theme, LayoutSettings } from '../types';
import { BOARD_STYLE_CONFIG } from '../constants';

export type BoardStyleId = keyof typeof BOARD_STYLE_CONFIG;

export interface BoardStyleClasses {
  container: string;
  lightSquare: string;
  darkSquare: string;
  selectedSquareBg: string;
  selectedSquareRing: string;
  possibleMoveDot: string;
  possibleMoveRing: string;
  lastMoveSquareOverlay: string;
  lastMoveFlashColorStart: string; 
  lastMoveFlashColorMid: string;   
  lastMoveFlashColorEnd: string;   
}

export function getBoardClasses(styleId: BoardStyleId, theme: Theme): BoardStyleClasses {
  const configForStyle = BOARD_STYLE_CONFIG[styleId];
  if (!configForStyle) {
    console.warn(`Invalid boardStyleId: ${styleId}. Falling back to default-dark.`);
    return BOARD_STYLE_CONFIG['default-dark'][theme] || BOARD_STYLE_CONFIG['default-dark']['dark'];
  }
  return configForStyle[theme] || configForStyle.light; 
}

/**
 * Determines the color for a chess piece icon.
 * Prioritizes custom colors from layoutSettings, then falls back to theme-based defaults.
 * @param playerColor The color of the player (White or Black).
 * @param theme The current application theme (light or dark).
 * @param layoutSettings The current layout settings, which may contain custom piece colors.
 * @returns A hex color string for the icon.
 */
export function getPieceIconColor(
  playerColor: PlayerColor,
  theme: Theme,
  layoutSettings: LayoutSettings
): string {
  if (playerColor === PlayerColor.WHITE) {
    if (layoutSettings.whitePieceColor) {
      return layoutSettings.whitePieceColor;
    }
    // Default white piece colors based on theme (Sober adjustments)
    return theme === 'dark' ? '#D1D5DB' : '#F3F4F6'; // Dark: gray-300, Light: gray-100
  } else { // PlayerColor.BLACK
    if (layoutSettings.blackPieceColor) {
      return layoutSettings.blackPieceColor;
    }
    // Default black piece colors based on theme (Sober adjustments)
    return theme === 'dark' ? '#4B5563' : '#374151'; // Dark: gray-600, Light: gray-700
  }
}