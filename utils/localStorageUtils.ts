import { HallOfFameEntry, GameMode, OnlineGameState, Theme, SavedGame, LayoutSettings, GameOverReason, CompletedGame } from '../types';

const HALL_OF_FAME_KEY = 'chessHallOfFame';
const MAX_HALL_OF_FAME_ENTRIES = 10;
const ONLINE_GAME_STATE_PREFIX = 'chess_online_game_'; // Prefix for online game states
const THEME_KEY = 'chessThemePreference';
const SAVED_GAMES_KEY = 'chessSavedGames';
const MAX_SAVED_GAMES = 5;
const LAYOUT_SETTINGS_KEY = 'chessLayoutSettings';
export const FIRST_VISIT_KEY = 'chessGameFirstVisitDone';
const COMPLETED_GAMES_KEY = 'chessCompletedGames';
const MAX_COMPLETED_GAMES = 10;


// --- Theme ---
export function getThemePreference(): Theme | null {
  try {
    const theme = localStorage.getItem(THEME_KEY) as Theme | null;
    return theme;
  } catch (error) {
    console.error("Error retrieving theme preference:", error);
    return null;
  }
}

export function setThemePreference(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.error("Error saving theme preference:", error);
  }
}


// --- Hall of Fame ---
export function getHallOfFameEntries(): HallOfFameEntry[] {
  try {
    const entriesJson = localStorage.getItem(HALL_OF_FAME_KEY);
    if (entriesJson) {
      const entries = JSON.parse(entriesJson) as HallOfFameEntry[];
      // Sort by gameStartDateTime, most recent first
      return entries.sort((a, b) => new Date(b.gameStartDateTime).getTime() - new Date(a.gameStartDateTime).getTime());
    }
  } catch (error) {
    console.error("Error retrieving Hall of Fame entries:", error);
  }
  return [];
}

export function saveHallOfFameEntry(
  winnerName: string, 
  opponentName: string, 
  mode: GameMode,
  gameStartTimeStamp: number | null, // Timestamp of game start
  playDurationSeconds: number | null,
  winReason?: GameOverReason | 'draw'
): void {
  if (!mode || mode === 'online') { 
      // For 'online' (same-device sim), we could save HoF entries if desired.
  }

  const newEntry: HallOfFameEntry = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    winnerName,
    opponentName,
    mode,
    gameStartDateTime: gameStartTimeStamp ? new Date(gameStartTimeStamp).toISOString() : new Date().toISOString(), // Fallback for safety
    playDurationSeconds,
    winReason,
  };

  try {
    let entries = getHallOfFameEntries();
    entries.unshift(newEntry);
    entries = entries.sort((a, b) => new Date(b.gameStartDateTime).getTime() - new Date(a.gameStartDateTime).getTime());
    entries = entries.slice(0, MAX_HALL_OF_FAME_ENTRIES);
    localStorage.setItem(HALL_OF_FAME_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error("Error saving Hall of Fame entry:", error);
  }
}

export function clearHallOfFame(): void {
  try {
    localStorage.removeItem(HALL_OF_FAME_KEY);
  } catch (error) {
    console.error("Error clearing Hall of Fame:", error);
  }
}

// --- Online Game State (localStorage based) ---
export function getOnlineGameStorageKey(gameId: string): string {
  return `${ONLINE_GAME_STATE_PREFIX}${gameId}`;
}

export function getOnlineGameState(gameId: string): OnlineGameState | null {
  try {
    const gameStateJson = localStorage.getItem(getOnlineGameStorageKey(gameId));
    if (gameStateJson) {
      return JSON.parse(gameStateJson) as OnlineGameState;
    }
  } catch (error) {
    console.error(`Error retrieving online game state for ${gameId}:`, error);
  }
  return null;
}

export function setOnlineGameState(gameId: string, gameState: OnlineGameState): void {
  try {
    localStorage.setItem(getOnlineGameStorageKey(gameId), JSON.stringify(gameState));
  } catch (error) {
    console.error(`Error saving online game state for ${gameId}:`, error);
  }
}

export function clearOnlineGameState(gameId: string): void {
  try {
    localStorage.removeItem(getOnlineGameStorageKey(gameId));
  } catch (error) {
    console.error(`Error clearing online game state for ${gameId}:`, error);
  }
}

// --- Saved Games ---
export function getSavedGames(): SavedGame[] {
  try {
    const savedGamesJson = localStorage.getItem(SAVED_GAMES_KEY);
    if (savedGamesJson) {
      const games = JSON.parse(savedGamesJson) as SavedGame[];
      return games.sort((a,b) => b.timestamp - a.timestamp); 
    }
  } catch (error) {
    console.error("Error retrieving saved games:", error);
  }
  return [];
}

export function saveGame(gameState: SavedGame): void {
  try {
    let savedGames = getSavedGames();
    savedGames = savedGames.filter(g => g.id !== gameState.id); 
    savedGames.unshift(gameState); 
    
    if (savedGames.length > MAX_SAVED_GAMES) {
      savedGames = savedGames.slice(0, MAX_SAVED_GAMES);
    }
    localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(savedGames));
  } catch (error) {
    console.error("Error saving game:", error);
  }
}

export function deleteSavedGame(gameId: string): void {
  try {
    let savedGames = getSavedGames();
    savedGames = savedGames.filter(game => game.id !== gameId);
    localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(savedGames));
  } catch (error) {
    console.error(`Error deleting saved game ${gameId}:`, error);
  }
}

export function clearAllSavedGames(): void {
  try {
    localStorage.removeItem(SAVED_GAMES_KEY);
  } catch (error) {
    console.error("Error clearing all saved games:", error);
  }
}

// --- Layout Settings ---
export function getLayoutSettings(): LayoutSettings | null {
  try {
    const settingsJson = localStorage.getItem(LAYOUT_SETTINGS_KEY);
    if (settingsJson) {
      const parsed = JSON.parse(settingsJson) as Partial<LayoutSettings>; // Partial for backward compatibility
      // Ensure all keys for LayoutSettings are returned with defaults for backward compatibility
      return {
        boardStyleId: parsed.boardStyleId || 'default-dark',
        pieceSetId: parsed.pieceSetId || 'default',
        whitePieceColor: parsed.whitePieceColor,
        blackPieceColor: parsed.blackPieceColor,
        isSoundEnabled: typeof parsed.isSoundEnabled === 'boolean' ? parsed.isSoundEnabled : true,
        showResignButton: typeof parsed.showResignButton === 'boolean' ? parsed.showResignButton : true,
        showGameToasts: typeof parsed.showGameToasts === 'boolean' ? parsed.showGameToasts : true,
        showUndoButton: typeof parsed.showUndoButton === 'boolean' ? parsed.showUndoButton : true,
        showHintButton: typeof parsed.showHintButton === 'boolean' ? parsed.showHintButton : true,
      };
    }
  } catch (error) {
    console.error("Error retrieving layout settings:", error);
  }
  return null;
}

export function setLayoutSettings(settings: LayoutSettings): void {
  try {
    // Only store known LayoutSettings properties
    const settingsToStore: LayoutSettings = {
        boardStyleId: settings.boardStyleId,
        pieceSetId: settings.pieceSetId,
        whitePieceColor: settings.whitePieceColor,
        blackPieceColor: settings.blackPieceColor,
        isSoundEnabled: settings.isSoundEnabled,
        showResignButton: settings.showResignButton,
        showGameToasts: settings.showGameToasts,
        showUndoButton: settings.showUndoButton,
        showHintButton: settings.showHintButton,
    };
    localStorage.setItem(LAYOUT_SETTINGS_KEY, JSON.stringify(settingsToStore));
  } catch (error) {
    console.error("Error saving layout settings:", error);
  }
}

// --- First Visit ---
export function getFirstVisitDone(): boolean {
  try {
    return localStorage.getItem(FIRST_VISIT_KEY) === 'true';
  } catch (error) {
    console.error("Error retrieving first visit status:", error);
    return false; // Assume not done if error
  }
}

export function setFirstVisitDone(): void {
  try {
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
  } catch (error) {
    console.error("Error saving first visit status:", error);
  }
}

// --- Completed Games History for Analysis ---
export function getCompletedGames(): CompletedGame[] {
  try {
    const gamesJson = localStorage.getItem(COMPLETED_GAMES_KEY);
    if (gamesJson) {
      const games = JSON.parse(gamesJson) as CompletedGame[];
      return games.sort((a, b) => new Date(b.gameStartDate).getTime() - new Date(a.gameStartDate).getTime());
    }
  } catch (error) {
    console.error("Error retrieving completed games:", error);
  }
  return [];
}

export function saveCompletedGame(game: CompletedGame): void {
  try {
    let games = getCompletedGames();
    // Prevent duplicates by checking ID (which is the gameStartTimeStamp)
    games = games.filter(g => g.id !== game.id);
    games.unshift(game); // Add new game to the beginning
    games = games.slice(0, MAX_COMPLETED_GAMES); // Keep only the last 10
    localStorage.setItem(COMPLETED_GAMES_KEY, JSON.stringify(games));
  } catch (error) {
    console.error("Error saving completed game:", error);
  }
}

export function clearCompletedGames(): void {
  try {
    localStorage.removeItem(COMPLETED_GAMES_KEY);
  } catch (error) {
    console.error("Error clearing completed games:", error);
  }
}