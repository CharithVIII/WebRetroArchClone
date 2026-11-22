<div align="center">

# 🎮 Handheld Arcade

**Your own game library in the browser. Import your PSP, PS1 and NES files, then play instantly.**
No installs, no accounts, no uploads. Everything stays on your device.

<br />

<a href="https://webretroarchclone.onrender.com/">
  <img src="https://img.shields.io/badge/%E2%96%B6%20%20LIVE%20DEMO-Play%20Now-6c8cff?style=for-the-badge&labelColor=181b26" alt="Live demo" height="48" />
</a>

<br /><br />

![PSP](https://img.shields.io/badge/PSP-.iso%20.cso%20.pbp-003791?style=flat-square&logo=playstationportable&logoColor=white)
![PS1](https://img.shields.io/badge/PS1-.cue%20.bin%20.chd-0070d1?style=flat-square&logo=playstation&logoColor=white)
![NES](https://img.shields.io/badge/NES-.nes-e60012?style=flat-square&logo=nintendo&logoColor=white)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)
![Static site](https://img.shields.io/badge/Hosting-Static-2ea44f?style=flat-square)
[![Hits](https://hits.sh/github.com/ismail-lsdevmain/WebRetroArchClone.svg?style=flat-square&label=hits&color=6c8cff)](https://hits.sh/github.com/ismail-lsdevmain/WebRetroArchClone/)

</div>

---

## ✨ Features

| | |
|---|---|
| 📥 **Drag & drop import** | Drop files anywhere on the page. `.cue` sheets automatically pick up their `.bin` files. |
| 💾 **Stored locally** | Games live in your browser's IndexedDB (via [`idb`](https://github.com/jakearchibald/idb)). Nothing is uploaded anywhere. |
| 🖼️ **Library grid** | Cover art upload, system filter tabs, per-game system selector and a remove button. |
| ⛶ **Full-screen play** | Click a card and the game opens in a full-screen player. `Esc` exits. |
| ⌨️ **WASD controls** | A comfortable keyboard layout by default, fully rebindable in-game. |
| 🧷 **Save states to JSON** | Save states are stored per game and slot, and can be downloaded or restored as a `.json` file. |
| 🧱 **Self-hosted emulator** | [EmulatorJS](https://emulatorjs.org) ships with the app. No CDN is needed for the cores. |
| 🛡️ **Clear errors** | Friendly messages for Safari, for missing isolation and for missing emulator files. |

## 🕹️ Supported systems

| System | Formats | Core | Notes |
|---|---|---|---|
| **PSP** | `.iso` `.cso` `.pbp` | `ppsspp` | Multi-threaded. Needs cross-origin isolation. |
| **PS1** | `.cue` `.bin` `.chd` | `pcsx_rearmed` | Prefer a single `.bin` or a `.chd`. Multi-`.bin` discs aren't supported yet. |
| **NES** | `.nes` | `fceumm` | Runs anywhere, no isolation needed. |

> **You bring the games.** This project does not include, host or download any games or BIOS files. Only import files you legally own.

## ⌨️ Default controls

| Action | Key | | Action | Key |
|---|---|---|---|---|
| D-pad | `W` `A` `S` `D` | | L / R | `Q` / `E` |
| A | `K` | | L2 / R2 | `Tab` / `R` |
| B | `J` | | Select | `Shift` |
| X | `I` | | Start | `Enter` |
| Y | `U` | | PSP analog stick | Arrow keys |

Rebind anything from the in-game **Control Settings** menu. **Reset** returns to this layout.

## 🚀 Run it locally

```bash
git clone https://github.com/ismail-lsdevmain/WebRetroArchClone.git
cd WebRetroArchClone
npm install
npm run dev        # http://localhost:5173
```

Production build:

```bash
npm run build
npm run preview    # http://localhost:4173
```

Then drag your own game files onto the page and press play.

## 🔒 Why the special headers?

The threaded PSP core uses `SharedArrayBuffer`, which browsers only enable on a **cross-origin isolated** page. The app handles this two ways:

1. **Headers:** `vite.config.js` sends `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` for both `dev` and `preview`.
2. **Fallback:** on hosts that can't set headers, a small service worker (`public/coi-sw.js`) adds them and the page reloads once.

Check it any time by running `crossOriginIsolated` in the browser console. It should print `true`.

## ☁️ Deploy it (static)

It's a plain static site. A `render.yaml` blueprint is included for [Render](https://render.com):

- **Build:** `npm install && npm run build`
- **Publish directory:** `dist`
- **Headers:** `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: credentialless` on `/*`

Any static host over HTTPS works. The app expects to be served from the site root.

## 🧰 Tech stack

**React 18** · **Vite 5** (multi-page: `index.html` + `play.html`) · **idb** · **EmulatorJS 4.2.3** (self-hosted in `public/emulatorjs/data/`)

## 🗂️ Project layout

```
├── index.html            # library page
├── play.html             # full-screen player (loaded in an iframe)
├── render.yaml           # Render static-site blueprint
├── public/
│   ├── emulatorjs/data/  # self-hosted EmulatorJS + cores
│   └── coi-*.js          # cross-origin isolation fallback
└── src/
    ├── App.jsx           # library UI
    ├── play.js           # boots EmulatorJS from IndexedDB
    ├── db.js             # IndexedDB (games, files, save states)
    ├── controls.js       # default WASD layout
    └── saveJson.js       # save-state JSON export / import
```

## 🩺 Troubleshooting

- **"crossOriginIsolated is false":** open the app over HTTPS or `localhost`, in Chrome, Edge or Firefox 119+, and let it reload once. Don't put it behind a proxy that strips headers.
- **Safari / iPhone / iPad:** not supported for PSP and PS1. NES still works.
- **"EmulatorJS not found":** make sure `public/emulatorjs/data/loader.js` exists.
- **Multi-`.bin` PS1 disc:** convert it to a single `.chd` or merge the tracks into one `.bin`.

## 📜 Credits & license

Built on [EmulatorJS](https://github.com/EmulatorJS/EmulatorJS) (GPL-3.0), which bundles the PPSSPP, PCSX-ReARMed and FCEUmm cores. The EmulatorJS files in `public/emulatorjs/data/` stay under their own license.

<div align="center">

Made for playing the games you already own. 🎧

</div>
