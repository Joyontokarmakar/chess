
# Classic Chess Championship - Free Online Chess Game

Hello! This is a fun and interactive **free chess game** you can play right in your browser. It's packed with cool features to make your chess experience awesome. You can **play chess with friends** locally, try to beat the challenging **chess AI** opponent, or simulate an **online chess** match. Plus, you can customize how the game looks to suit your style! This **React chess application** is designed for both beginners and seasoned players.

## How to Play (Features & Chess Strategy)

Master the game with standard chess rules and unique features:

*   **Standard Chess Rules:** All fundamental rules are implemented.
    *   **Pawn Promotion:** If your pawn reaches the opponent's back rank, it can be promoted to a Queen, Rook, Bishop, or Knight – a key element of **chess strategy**.
    *   **Castling:** Perform the special King and Rook move for King safety.
    *   **En Passant:** Execute this special pawn capture.
*   **Legal Move Validation:** The game ensures all moves are valid according to chess rules.
*   **Game End Conditions:** The game accurately detects:
    *   **Checkmate:** Trap the opponent's King to win!
    *   **Stalemate:** If no legal moves can be made and the King is not in check, the game is a draw.
*   **King in Check Indication:** Visual alerts if your King is under attack. **Learn chess rules** about check and checkmate as you play.

## Ways to Play Chess

*   **Play with a Friend (Local Multiplayer):** Two players can compete on the same computer.
*   **Play Against the Computer (Chess AI):** Challenge our intelligent AI opponent.
    *   Powered by Gemini AI for strong gameplay (requires API key).
    *   A basic offline AI is available if the Gemini API key is not configured.
*   **Play Online (Simulated):**
    *   Create a unique Game ID to share with a friend for a simulated online match.
    *   *Note: This feature uses localStorage for local network or same-device play, not true internet multiplayer.*

## Customize Your Chess Experience

*   **Player Names:** Personalize the game by setting names for Player 1 and Player 2.
*   **Light/Dark Theme:** Switch between sleek light and dark visual modes.
*   **Appearance Customization:**
    *   **Board Styles:** Choose from various board themes like Classic Wood, Cool Blue, and Forest Green.
    *   **Piece Colors:** Select distinct colors for White and Black pieces.
    *   An intuitive modal allows you to preview and apply these settings.

## User Interface & Experience

*   **Intuitive Controls:** Click a piece, then click its destination square to move.
*   **Possible Moves Display:** See all valid moves for your selected piece.
*   **Captured Pieces Display:** Clearly track pieces captured by each player.
*   **Turn Indication:** Always know whose turn it is.
*   **Game Status Messages:** Stay informed with messages like "Your turn," "King in Check!", or "Checkmate!"
*   **Promotion Modal:** Easily choose your promotion piece when a pawn reaches the final rank.
*   **Welcome Screen:** A user-friendly start screen to select game modes or view the Hall of Fame.
*   **Responsive Design:** Enjoy a seamless experience on desktops, tablets, and mobile phones.

## Manage Your Games

*   **Game Menu:** Access all game options through a convenient menu.
*   **Save & Load Games:**
    *   Save your current game to resume later.
    *   Load previously saved games.
    *   Delete unwanted saved games.
*   **Hall of Fame:**
    *   Tracks winners from "Play with Friend" and "Play AI" modes.
    *   Displays winner, opponent, and game date.
    *   Option to clear the Hall of Fame.
*   **Reset & New Game:** Easily start a new game or return to the main menu.
*   **In-Game Chess Guide:** **Learn chess rules**, piece movements, and special moves with our comprehensive built-in guide. Perfect for beginners or as a quick refresher.

## Technical Details

*   Built with modern web technologies: React, TypeScript, and Tailwind CSS.
*   Utilizes localStorage for persisting theme preferences, saved games, layout settings, and Hall of Fame entries.

Have fun playing this engaging **chess game** and sharpening your **chess strategy**!
