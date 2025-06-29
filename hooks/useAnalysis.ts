import { useState, useCallback } from 'react';
import { GameAnalysis, MoveHistoryEntry, ToastType } from '../types';
import { analyzeGame as fetchGameAnalysis } from '../utils/geminiApi';

interface UseAnalysisProps {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
}

export const useAnalysis = ({ addToast }: UseAnalysisProps) => {
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const runAnalysis = useCallback(async (moveHistory: MoveHistoryEntry[]) => {
    if (moveHistory.length === 0) {
      addToast("No moves to analyze.", 'warning');
      return;
    }
    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisError(null);
    addToast("Analyzing game with Gemini...", 'info', 5000);

    try {
      const result = await fetchGameAnalysis(moveHistory);
      if (result) {
        setAnalysis(result);
        addToast("Analysis complete!", 'success');
      } else {
        throw new Error("Received an empty analysis from the server.");
      }
    } catch (error) {
      console.error("Game analysis failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setAnalysisError(`Analysis failed: ${errorMessage}`);
      addToast(`Analysis failed: ${errorMessage}`, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  }, [addToast]);
  
  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setIsAnalyzing(false);
    setAnalysisError(null);
  }, []);

  return {
    analysis,
    isAnalyzing,
    analysisError,
    runAnalysis,
    clearAnalysis,
  };
};
