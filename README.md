## 🌐 AidLoop: Financial Interoperability and Intelligent Assistance

Integrantes:
- Lara Martínez Christian Gael
- Ávalos Juárez Eder
- Hernández Ruiz Paula Mabel 
- Casteñada Ávila Leonardo Isay

> Developed during an intense night session by **Los 0KM** (The 0KM Team).

AidLoop is a mobile application designed to **facilitate fast and secure fund transfers using interoperable protocols (Open Payments) and offer intelligent analysis or contextual support (Gemini AI)** for its users, ensuring an efficient and assisted financial experience.

---

### 🛠️ Technology Stack

The AidLoop project integrates a modern and efficient stack for full-stack development and intelligent data management.

| Component | Key Technology | Language | Specific Role in AidLoop |
| :---: | :---: | :---: | :--- |
| **Backend Core** | **Go (Golang)** | Go | Centralizes the API, business logic, database handling, and communication with Open Payments. |
| **Artificial Intelligence** | **Gemini AI API** | Python / Go | Implements AI functions for transaction classification, anomaly detection, or report generation. |
| **Database** | **SQLite** | N/A | Lightweight, transactional storage for local data, logs, and system configurations. |
| **Frontend/App** | **React Native** | TypeScript (TS) | Cross-platform mobile interface (iOS/Android) with typed code, consuming the Go API. |
| **Utilities/Scripts** | **Python** | Python | Manages auxiliary tasks, setup scripts, or initialization routines. |
| **Version Control** | **Git & GitHub** | N/A | Robust source code management and hosting platform. |

---

# This is the guide for installing

This guide explains how to **set up, configure, and run** all parts of your project step by step.  
Your repository contains four main components:

- 🟦 **`backend/`** → Server built with **Go (Golang)**
- 🟩 **`frontend/`** → Web interface built with **React + Vite + Tailwind CSS**
- 🟨 **`Midonacion/`** → Mobile app built with **React Native / Expo**
- ⚪ **`test/`** → Testing environment for chatbot and other modules

---

## 🧩 1. Requirements

Before running the project, make sure you have the following tools installed.

### 🔹 Global dependencies

| Tool | Minimum version | Check command |
|------|-----------------|----------------|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Go | 1.21+ | `go version` |
| Git | — | `git --version` |

### 🔹 Module-specific dependencies

| Module | Additional dependencies |
|--------|--------------------------|
| `Midonacion/` | [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`) |
| `frontend/` | Tailwind & Vite are already included in `package.json` |
| `backend/` | SQLite3 (used for `bd.db` database file) |

---

## 🚀 2. Running the **Backend (Go API)**

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:
```bash
go mod tidy
```

Run the server:
```bash
go run main.go
```

By default, the API runs on `http://localhost:8080`.  
You can verify it by visiting:
```
http://localhost:8080/health
```
(or any other configured route).

---

## 🧠 3. Testing the **Chatbot**

### Option A: Go-based chatbot
```bash
cd backend/chatbot
go run client.go
```

### Option B: Python-based chatbot (testing mode)
```bash
cd test/chatbot
pip install -r requirements.txt
python app.py
```

If you use **`uv`** (as shown in `uv.lock`):
```bash
uv pip install -r requirements.txt
uv run app.py
```

---

## 🖥️ 4. Running the **Frontend (Web)**

```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

(Alternatively, if you use Bun:)
```bash
bun install
```

Run the development server:
```bash
npm run dev
```
or
```bash
bun run dev
```

Then open the provided link, usually:  
👉 `http://localhost:5173`

---

## 📱 5. Running the **Mobile App (Midonacion)**

```bash
cd Midonacion
```

Install dependencies:
```bash
npm install
```

Run using Expo:
```bash
npx expo start
```

This will open **Metro Bundler** in your browser.  
From there, you can:
- Press **“a”** → open Android emulator  
- Press **“i”** → open iOS simulator  
- Scan the **QR code** with the **Expo Go** app on your phone  

---

## 🧪 6. Recommended Execution Structure

You can run all systems simultaneously using the following setup:

| Service | Suggested port | Command |
|----------|----------------|----------|
| Backend (Go) | `:8080` | `go run main.go` |
| Frontend (React Vite) | `:5173` | `npm run dev` |
| Mobile App (Expo) | `:8081` | `npx expo start` |
| Chatbot Test (Python) | `:5000` or `:8000` | `python app.py` |

---

## 🧰 7. (Optional) Clean Setup

If dependencies break or conflicts occur, reset everything cleanly:

```bash
# Frontend
cd frontend
rm -rf node_modules bun.lock package-lock.json
npm install

# Midonacion
cd ../Midonacion
rm -rf node_modules package-lock.json
npm install

# Backend
cd ../backend
go clean -modcache
go mod tidy
```

---

## ✅ Final Verification

Once everything is running, you should have:

| Component | Local URL / Output |
|------------|--------------------|
| 🌐 Web Frontend | `http://localhost:5173` |
| ⚙️ API Backend | `http://localhost:8080` |
| 📱 Mobile App | Expo Go (on your phone) |
| 💬 Chatbot | Running in terminal or via endpoint |

---

## 💡 (Optional) Run All Services Together

You can create a `package.json` script using [`concurrently`](https://www.npmjs.com/package/concurrently) to start everything with a single command, e.g.:

```bash
npm install concurrently --save-dev
```

Then in `frontend/package.json`:
```json
"scripts": {
  "dev:all": "concurrently \"cd ../backend && go run main.go\" \"npm run dev\" \"cd ../Midonacion && npx expo start\""
}
```

Now run:
```bash
npm run dev:all
```
