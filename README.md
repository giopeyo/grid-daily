# Daily Reddit Grid (Devvit 4x4 Categorical Logic Game)

An interactive, daily 4x4 logic puzzle built specifically for Reddit's Developer Platform (**Devvit**), modeled after the viral hit *NYT Connections*.

Embeds seamlessly as an interactive canvas directly inside Reddit posts on iOS, Android, and Web feeds.

---

## Architecture Overview

* **Client**: React 18 SPA built with Vite (`src/client/`). Total bundle footprint is **~48 KB gzipped** (well below the 250 KB Reddit mobile budget), ensuring sub-second cold starts on mobile feeds.
* **Server**: Hono serverless router (`src/server/index.ts`) running on Reddit's native Devvit runtime.
* **Persistence**: Devvit Managed Redis with automated bounded key expiry (48h TTL on daily game sessions, top-500 trimmed leaderboards using `ZREMRANGEBYRANK`) to protect against the 500 MB quota ceiling.
* **Monetization**: Configured with `products.json` for Reddit Gold in-app purchases (Streak Shield Tokens, Supporter Themes, Archive Pass).

---

## Directory Structure

```
daily-reddit-grid/
├── devvit.json            # Official Devvit manifest (post webviews, cron schedules, mod menus)
├── products.json          # Reddit Gold IAP products catalog
├── package.json           # Dependencies & scripts (@devvit/public-api, @devvit/web)
├── vite.config.ts         # Vite build configuration for client webview
├── tsconfig.json          # TypeScript configuration
├── dist/                  # Compiled production webview client
└── src/
    ├── shared/            # Shared TypeScript contracts (puzzles, guesses, profiles)
    ├── client/            # React 18 interactive frontend
    │   ├── index.html
    │   ├── main.tsx
    │   └── App.tsx
    └── server/            # Serverless micro-backend
        ├── index.ts       # Hono API & Redis game logic
        └── data/
            └── puzzles.ts # Pre-curated daily puzzle corpus
```

---

## How to Test and Deploy to Reddit

### 1. Log in to Reddit Devvit CLI
```bash
devvit login
```
*(This opens a browser tab to connect your Reddit developer account.)*

### 2. Test locally in your test subreddit
Create a private test subreddit (e.g., `r/MyGame_Sandbox`), then run:
```bash
devvit upload
devvit install <your-sandbox-subreddit>
```

### 3. Build & Preview Client Webview
To run the client preview standalone in your browser:
```bash
npm run dev:client
```
To build production client assets:
```bash
npm run build
```

---

## Features & Viral Mechanics

1. **Anti-Cheat Validation**: Category answer groupings are kept strictly on the server; the client receives only a randomized list of items.
2. **One-Away Feedback**: Detects when 3 out of 4 selected items belong to the same category to provide encouraging *"One away..."* hints.
3. **Daily UTC Synchronization**: Puzzle resets daily at 00:00 UTC.
4. **Spoiler-Free Share Cards**: Exports clean emoji result grids (e.g., `🟩🟩🟩🟩`, `🟨🟨⬜🟨`) ready to paste into Reddit post comment threads without triggering AutoMod spam filters.
5. **Loss-Aversion Streaks**: Integrates streak tracking with Reddit Gold "Streak Shield" protection.
