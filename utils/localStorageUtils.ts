import { HallOfFameEntry, GameMode, OnlineGameState, Theme, SavedGame, LayoutSettings } from '../types';

const HALL_OF_FAME_KEY = 'chessHallOfFame';
const MAX_HALL_OF_FAME_ENTRIES = 10;
const ONLINE_GAME_STATE_PREFIX = 'chess_online_game_';
const THEME_KEY = 'chessThemePreference';
const SAVED_GAMES_KEY = 'chessSavedGames';
const MAX_SAVED_GAMES = 5;
const LAYOUT_SETTINGS_KEY = 'chessLayoutSettings';


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
      return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  } catch (error) {
    console.error("Error retrieving Hall of Fame entries:", error);
  }
  return [];
}

export function saveHallOfFameEntry(winnerName: string, opponentName: string, mode: GameMode): void {
  if (!mode || mode === 'online' || mode === 'loaded_friend') { // Don't save for 'online' or 'loaded_friend' games in HoF directly
      if (mode === 'online') console.log("Online games not saved to Hall of Fame directly.");
      return;
  }

  const newEntry: HallOfFameEntry = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    winnerName,
    opponentName,
    mode, // Will be 'friend' or 'computer'
    date: new Date().toLocaleDateString(),
  };

  try {
    let entries = getHallOfFameEntries();
    entries.unshift(newEntry);
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

// --- Online Game State ---
export function getOnlineGameStorageKey(gameId: string): string {
  return `${ONLINE_GAME_STATE_PREFIX}${gameId}`;
}

export function getOnlineGameState(gameId: string): OnlineGameState | null {
  try {
    const stateJson = localStorage.getItem(getOnlineGameStorageKey(gameId));
    if (stateJson) {
      return JSON.parse(stateJson) as OnlineGameState;
    }
  } catch (error) {
    console.error(`Error retrieving online game state for ${gameId}:`, error);
  }
  return null;
}

export function setOnlineGameState(gameId: string, state: OnlineGameState): void {
  try {
    localStorage.setItem(getOnlineGameStorageKey(gameId), JSON.stringify(state));
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
      return games.sort((a,b) => b.timestamp - a.timestamp); // Newest first
    }
  } catch (error) {
    console.error("Error retrieving saved games:", error);
  }
  return [];
}

export function saveGame(gameState: SavedGame): void {
  try {
    let savedGames = getSavedGames();
    // Add new game and ensure ID is unique (though timestamp + random suffix should be enough)
    savedGames = savedGames.filter(g => g.id !== gameState.id); // Remove if somehow exists
    savedGames.unshift(gameState); // Add to the beginning (newest)
    
    // Limit the number of saved games
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
      return JSON.parse(settingsJson) as LayoutSettings;
    }
  } catch (error) {
    console.error("Error retrieving layout settings:", error);
  }
  return null;
}

export function setLayoutSettings(settings: LayoutSettings): void {
  try {
    localStorage.setItem(LAYOUT_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving layout settings:", error);
  }
}
