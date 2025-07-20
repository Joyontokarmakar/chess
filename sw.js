const CACHE_NAME = 'classic-chess-v6';
// Add all local files to cache.
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/App.tsx',
  '/constants.ts',
  '/types.ts',
  '/metadata.json',
  '/ads.txt',
  '/content/aboutContent.tsx',
  '/content/privacyContent.tsx',
  '/content/termsContent.tsx',
  '/components/AdBanner.tsx',
  '/components/AnalysisPanel.tsx',
  '/components/AnalysisView.tsx',
  '/components/Board.tsx',
  '/components/CapturedPiecesDisplay.tsx',
  '/components/ChangelogModal.tsx',
  '/components/ChessGuide.tsx',
  '/components/DashboardMenu.tsx',
  '/components/GameOverOverlay.tsx',
  '/components/GameHistoryModal.tsx',
  '/components/InfoModal.tsx',
  '/components/LayoutCustomizationModal.tsx',
  '/components/Logo.tsx',
  '/components/MenuModal.tsx',
  '/components/OnlineGameSetup.tsx',
  '/components/OnlineWarningModal.tsx',
  '/components/PieceDisplay.tsx',
  '/components/PlayerDisplayPanel.tsx',
  '/components/PlayerNameEntry.tsx',
  '/components/PromotionModal.tsx',
  '/components/PuzzleControls.tsx',
  '/components/RenamePlayerModal.tsx',
  '/components/ResignConfirmationModal.tsx',
  '/components/SavedGamesList.tsx',
  '/components/Square.tsx',
  '/components/ThemeToggle.tsx',
  '/components/TimeModeSelectionModal.tsx',
  '/components/Toast.tsx',
  '/components/ToastContainer.tsx',
  '/components/WelcomeModal.tsx',
  '/hooks/useAI.ts',
  '/hooks/useAnalysis.ts',
  '/hooks/useGameState.ts',
  '/hooks/useLayoutSettings.ts',
  '/hooks/useOnlinePlay.ts',
  '/hooks/usePlayerManagement.ts',
  '/hooks/useSavedGames.ts',
  '/hooks/useTheme.ts',
  '/hooks/useToasts.ts',
  '/hooks/useUIState.ts',
  '/utils/chessLogic.ts',
  '/utils/firebaseUtils.ts',
  '/utils/geminiApi.ts',
  '/utils/localStorageUtils.ts',
  '/utils/soundUtils.ts',
  '/utils/styleUtils.ts',
  // External resources
  'https://cdn.tailwindcss.com',
  'https://actions.google.com/sounds/v1/sports/wooden_bat_hits_baseball_run.ogg',
  'https://actions.google.com/sounds/v1/doors/screen_door_close.ogg',
  'https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg',
  // ESM modules - Caching main entry points
  "https://esm.sh/react-dom@^19.1.0/",
  "https://esm.sh/react@^19.1.0/",
  "https://esm.sh/react@^19.1.0",
  "https://esm.sh/@google/genai",
  "https://esm.sh/firebase@^11.9.1/",
  "https://esm.sh/react-icons/fa?pin=v6",
  "https://esm.sh/react-icons/gi?pin=v6",
  "https://esm.sh/react-icons@^5.5.0/"
];


self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Add all URLs to cache, but don't fail the entire installation if one fails.
        // This is safer for external resources.
        const promises = urlsToCache.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn(`Failed to cache ${url}:`, err);
          });
        });
        return Promise.all(promises);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200) {
              return response;
            }
            // Check if the response is from a CDN we trust to cache
            const isCachable = event.request.url.startsWith('https://esm.sh/') || event.request.url.startsWith('https://cdn.tailwindcss.com');

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            if(isCachable){
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
            }

            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});