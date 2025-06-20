// utils/soundUtils.ts

/**
 * Plays a sound file if sound is enabled.
 * @param soundFile The path to the sound file (e.g., '/sounds/move.mp3' or an online URL).
 * @param isSoundEnabled Boolean indicating whether sound should be played.
 */
export const playSound = (soundFile: string, isSoundEnabled: boolean): void => {
  if (!isSoundEnabled) {
    return; // Do not play sound if disabled
  }

  try {
    const audio = new Audio(soundFile);
    // audio.play() returns a Promise which can be rejected if autoplay is blocked.
    // We'll log a warning if it fails but not crash the app.
    audio.play().catch(error => {
      console.warn(`Error playing sound "${soundFile}":`, error);
      // Common reasons for failure:
      // 1. Browser autoplay policies (usually requires user interaction first, which clicks provide).
      // 2. Invalid sound file path or format.
    });
  } catch (error) {
    // This catch is for errors during Audio object creation itself.
    console.warn(`Could not create or play sound "${soundFile}":`, error);
  }
};