# Platformer Shooter - Installation Guide

A step-by-step guide to get the game running on your computer.

---

## Step 1: Install Node.js

Node.js is required to run this game. **npm** (the package manager) is included automatically.

### Download Node.js

1. Open your browser and go to **[https://nodejs.org/](https://nodejs.org/)**
2. Click the big green **LTS** button to download
3. Open the downloaded file and follow the installation steps
4. **Important:** Restart your computer after installation

### Check if it worked

Open **Terminal** (Mac) or **Command Prompt** (Windows):
- Mac: Press `Cmd + Space`, type "Terminal", press Enter
- Windows: Press `Win + R`, type "cmd", press Enter

Type this command and press Enter:
```
node --version
```

If you see a version number like `v20.10.0`, you're ready! If not, try restarting your computer.

---

## Step 2: Download the Game

### 1. Download ZIP
1. Extract the ZIP file to your desired location

---

## Step 3: Install and Run

Open Terminal/Command Prompt and navigate to the game folder:
```
cd path/to/platformer-shooter
```

Install the game dependencies:
```
npm install
```

Start the game:
```
npm run dev
```

The game will open in your browser at `http://localhost:5173`

---

## Controls

| Key | Action |
|-----|--------|
| **← / A** | Move Left |
| **→ / D** | Move Right |
| **↑ / W / Space** | Jump |
| **Mouse Click** | Shoot |
| **ESC** | Pause |

---

## Troubleshooting

**"npm: command not found"**
- Restart your computer after installing Node.js

**"EACCES permission denied"**
- On Mac/Linux, try: `sudo npm install`

**Game doesn't open in browser**
- Manually open `http://localhost:5173` in your browser
