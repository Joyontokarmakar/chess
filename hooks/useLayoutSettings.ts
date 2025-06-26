
import { useState, useEffect, useCallback } from 'react';
import { LayoutSettings, BoardStyleId, Theme } from '../types';
import { getLayoutSettings as getLayoutSettingsFromStorage, setLayoutSettings as setLayoutSettingsInStorage } from '../utils/localStorageUtils';

const initialDefaultLayoutSettings: LayoutSettings = {
  boardStyleId: 'default-dark' as BoardStyleId,
  whitePieceColor: undefined,
  blackPieceColor: undefined,
  isSoundEnabled: true,
  showResignButton: true,
  showGameToasts: true,
  showUndoButton: true,
  showHintButton: true,
};

export const useLayoutSettings = (currentTheme: Theme) => {
  const [layoutSettings, setLayoutSettingsState] = useState<LayoutSettings>(initialDefaultLayoutSettings);
  const [isLayoutSettingsInitialized, setIsLayoutSettingsInitialized] = useState<boolean>(false);

  useEffect(() => {
    const loadedSettings = getLayoutSettingsFromStorage();
    if (loadedSettings) {
      setLayoutSettingsState(loadedSettings);
    } else {
      // If no settings in storage, derive initial board style from theme
      setLayoutSettingsState(prev => ({
        ...prev,
        boardStyleId: currentTheme === 'dark' ? 'default-dark' : 'default-light',
      }));
    }
    setIsLayoutSettingsInitialized(true);
  }, [currentTheme]);

  const handleLayoutSettingsChange = useCallback((newSettings: LayoutSettings) => {
    setLayoutSettingsState(newSettings);
    setLayoutSettingsInStorage(newSettings);
  }, []);

  return { layoutSettings, handleLayoutSettingsChange, isLayoutSettingsInitialized };
};