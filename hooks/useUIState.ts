import { useState, useCallback } from 'react';
import { PlayerColor } from '../types';
import { getFirstVisitDone, setFirstVisitDone as persistFirstVisitDone } from '../utils/localStorageUtils';

export type InfoPageType = 'about' | 'terms' | 'privacy';

export const useUIState = (initialShowWelcomeModal: boolean) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [viewingHallOfFame, setViewingHallOfFame] = useState<boolean>(false);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [isChessGuideOpen, setIsChessGuideOpen] = useState(false);
  const [isChangelogModalOpen, setIsChangelogModalOpen] = useState(false);
  const [isResignModalOpen, setIsResignModalOpen] = useState<boolean>(false);
  const [playerAttemptingResign, setPlayerAttemptingResign] = useState<PlayerColor | null>(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState<boolean>(false);
  const [playerToRename, setPlayerToRename] = useState<PlayerColor | null>(null);
  const [isOnlineWarningModalOpen, setIsOnlineWarningModalOpen] = useState<boolean>(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState<boolean>(initialShowWelcomeModal);
  const [isGameHistoryModalOpen, setIsGameHistoryModalOpen] = useState<boolean>(false);
  const [infoPage, setInfoPage] = useState<InfoPageType | null>(null);

  const handleWelcomeModalClose = useCallback(() => {
    setShowWelcomeModal(false);
    persistFirstVisitDone();
  }, []);
  
  const resetUIState = useCallback(() => {
    setIsMenuOpen(false);
    setViewingHallOfFame(false);
    setIsLayoutModalOpen(false);
    setIsChessGuideOpen(false);
    setIsChangelogModalOpen(false);
    setIsResignModalOpen(false);
    setPlayerAttemptingResign(null);
    setIsRenameModalOpen(false);
    setPlayerToRename(null);
    setIsOnlineWarningModalOpen(false);
    setIsGameHistoryModalOpen(false);
    setInfoPage(null);
    // setShowWelcomeModal(false); // Welcome modal is handled by first visit logic usually
  }, []);

  return {
    isMenuOpen, setIsMenuOpen,
    viewingHallOfFame, setViewingHallOfFame,
    isLayoutModalOpen, setIsLayoutModalOpen,
    isChessGuideOpen, setIsChessGuideOpen,
    isChangelogModalOpen, setIsChangelogModalOpen,
    isResignModalOpen, setIsResignModalOpen,
    playerAttemptingResign, setPlayerAttemptingResign,
    isRenameModalOpen, setIsRenameModalOpen,
    playerToRename, setPlayerToRename,
    isOnlineWarningModalOpen, setIsOnlineWarningModalOpen,
    showWelcomeModal,
    handleWelcomeModalClose,
    isGameHistoryModalOpen, setIsGameHistoryModalOpen,
    infoPage, setInfoPage,
    resetUIState,
  };
};
