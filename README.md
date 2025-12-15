# CodeClash: Real-Time Competitive Coding Arena

CodeClash is a low-latency, real-time competitive programming environment built for engineers to benchmark their algorithmic runtime against others. The platform features live code synchronization and a server-verified submission system to determine the winner of each match.

This project is split into a Next.js frontend and a Node.js/Socket.IO backend.

## 🚀 Architecture and Technology Stack

The application is built on a modern stack focused on speed and real-time capability:

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14+** (React), Tailwind CSS, Zustand | Provides a modern, responsive interface using the App Router and efficient state management. |
| **Code Editor** | **Monaco Editor** | The core coding environment, supporting syntax highlighting and boilerplate code switching for multiple languages. |
| **Real-time Engine** | **Node.js, Socket.IO** | Manages live bidirectional communication for code synchronization and instant match state updates. |
| **Languages** | C++, Python, Java, JavaScript | Supports multiple popular competitive programming languages via modular boilerplate templates. |

## ✨ Core Features

### 1. Real-Time Competition (PvP Mode)
* **Live Code Sync:** Opponent's code changes are instantly reflected in your editor via WebSockets.
* **First-to-Solve:** The first player to submit a correct solution ends the match and is declared the winner, earning a mock MMR increase.
* **Match Status Broadcast:** All players in the room receive immediate notifications when a match is won, including the winner's name and the score change.

### 2. Dynamic Problem Set
* **Problem Pool:** The system uses a predefined pool of 10 different algorithmic problems.
* **Random Assignment:** For every new multiplayer session, the backend randomly selects one problem and assigns it to all players in the room simultaneously, ensuring a fair competition.

### 3. Developer Tools
* **Diagnostic Mode:** Allows users to run code and test output locally without affecting their rating or entering a match (`/arena?mode=test`).
* **Multiple Language Support:** Provides starter code and syntax support for four common languages.

## 🛠️ Getting Started (Local Setup)

To run this project locally, you need Node.js (v18+) and npm/yarn/pnpm installed.

### 1. Backend Setup (`server` directory)

The backend must be running first to handle socket connections.

```bash
# 1. Navigate to the server directory
cd server

# 2. Install dependencies
npm install

# 3. Create a .env file for configuration (Optional: PORT defaults to 4000)
echo "PORT=4000" > .env

# 4. Start the server (uses ts-node and nodemon for development)
npm run dev