# ♟️ Custom Chess Game

A modern, feature-rich, and fully customizable **chess game** built with React, TypeScript, and Tailwind CSS. Play chess **locally with a friend**, **against a smart AI**, or enjoy a **tactics training mode** — all from your browser. Designed for both beginners and experienced players, this game blends classic chess rules with a sleek, intuitive interface.

## 🚀 Live Demo

👉 [Play the Game](#)  
(*Replace this with your actual deployed link*)

---

## 🧠 Game Modes

- **Player vs AI** – Choose difficulty: *Easy*, *Medium*, *Hard*, or *Grandmaster*
- **Player vs Player** – Play with a friend locally on the same device
- **Puzzle Mode / Tactics Trainer** – Solve chess puzzles to sharpen your skills
- **Simulated Online Mode** – Share a unique Game ID to play on the same device (not internet multiplayer)

---

## 🕹️ Core Gameplay Features

- ♟️ **Standard Rules**: Pawn Promotion, Castling, En Passant, Check, Checkmate, and Stalemate detection
- ✅ **Legal Move Validation**
- 🧠 **AI Engine**:
  - Gemini-powered AI (API key required)
  - Basic offline fallback AI
- ⏳ **Timer Mode**
- 🔁 **Undo Moves** (optional)
- 💡 **AI Move Hints** (optional)
- 🎉 **Confetti celebration** on checkmate
- 🔊 **Game Sounds**: Move, capture, win
- 👑 **Captured Pieces Display**
- 🔔 **Smart Toast Notifications**: “Check”, “Your Turn”, “Checkmate”, etc.
- 🧭 **In-Game Chess Guide** for beginners and rule refreshers

---

## 🎨 Personalization & Themes

- 🌓 **Light / Dark Modes**
- 🎨 **Custom Board Styles**: Classic Wood, Cool Blue, Forest Green, etc.
- ♔ **Multiple Piece Sets**: Default, Staunton, Merida
- 🖊️ Rename players mid-game
- 🧰 UI Toggle Options:
  - Show/Hide Resign, Undo, Hint buttons
  - Enable/Disable toast messages

---

## 💻 Progressive Web App (PWA)

- 📲 **Installable App**: Add the chess game to your home screen or desktop for faster access
- 🌐 **Offline Play Support**: Fully functional without an internet connection (non-AI modes)
- 🖥️ **Desktop Sidebar Layout**: Quick access to game modes, settings, and navigation

---

## 🧩 Learn & Improve

- 📖 **Chess Guide**: Piece movement, rules, and strategies built right into the app
- 👀 Visual indicators for:
  - Last move made
  - Pieces under check
  - Available legal moves
- 📊 **Game History & Analysis**: View and analyze your last 10 games move-by-move

---

## 💾 Game Management

- 💾 **Save/Load Games** using `localStorage`
- 🏆 **Hall of Fame**:
  - Tracks winners and match info for AI and local games
  - Clear history anytime
- 🔁 **Start New Game / Reset Options**
- 📋 **Game Menu** with modals and navigational UI
- 📄 **Informational Pages**:
  - About the Developer
  - Terms & Conditions
  - Privacy Policy

---

## 🔄 Drag & Drop Movement

You can now move pieces by **clicking or dragging** — your choice! Intuitive controls make it easy for all ages.

---

## 🆕 Version Highlights

### 🆕 Version 5.0 – *PWA & UI/UX Enhancements* (2024-08-10)
- ✅ **Progressive Web App (PWA)**: Install on mobile/desktop for native-like usage
- ✅ **Offline Mode** for non-AI games
- ✅ **Desktop Sidebar Layout** for better navigation
- ✅ **Multiple Piece Sets**: Choose between Default, Staunton, and Merida
- ✅ **Drag-and-Drop Support** for moving pieces
- 🔄 Smoother transitions, improved responsiveness
- 🐞 Fixed AI setup and critical UI state error

### Version 4.3 – *Architectural Fixes & UI Enhancements*
- 🔧 Fixed major logic bug in launching game modes
- 📊 Added Multi-Game History + detailed move analysis
- 📄 Added “About,” “Terms,” and “Privacy Policy” pages
- 🖼️ Visual polish: Gradient buttons, icon improvements
- 🎮 Improved Game Over experience with rematch and return options
- 🐞 Puzzle mode bug fixed

### Version 4.2 – *Modern UX Upgrade*
- Welcome screen for new players
- Resign, Undo, Hint buttons improved and repositioned
- Mobile responsiveness upgraded

---

## 📱 Responsive Design

- Seamless experience across **desktops**, **tablets**, and **mobile phones**
- Adaptive menus, layouts, and modals for every screen size

---

## 📂 Project Structure

```bash
📁 /public
📁 /src
 ├── assets/       # Icons, graphics
 ├── components/   # Reusable React components
 ├── data/         # Chess puzzles, guide content
 ├── utils/        # Game logic, helpers
 └── App.tsx       # Main app entry point
