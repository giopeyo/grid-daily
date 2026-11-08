# Post-Approval Playbook: Grid Daily (Devvit)

Congratulations on launching **Grid Daily**! Once Reddit reviews and approves your public app submission (`grid-daily`), this playbook guides your transition from pending review to community growth and monetization.

---

## 1. Immediate Verification (Hour 1 Post-Approval)

When you receive the confirmation email from Reddit Developer Relations:

1. **Verify App Directory Listing**
   * Visit the [Reddit App Directory](https://developers.reddit.com/apps) or search `grid-daily`.
   * Confirm the app card appears with your custom 1024x1024 icon, title, and description.
2. **Test Real Reddit Gold Checkout**
   * Navigate to [r/PlayGridDaily](https://www.reddit.com/r/PlayGridDaily/).
   * Open the interactive post.
   * Trigger the store modal to test the `streak_shield_token` (50 Gold) and `supporter_obsidian_theme` (300 Gold).
   * Confirm that the native Reddit Gold checkout sheet opens seamlessly.
3. **Verify Reddit Developer Payout Setup**
   * Visit [Reddit Developer Portal](https://developers.reddit.com/).
   * Navigate to **Settings > Payouts / Developer Funds**.
   * Link your Stripe / Hyperwallet account to receive direct deposits for both Reddit Gold earnings and Developer Fund milestone bonuses.

---

## 2. Daily Title and Reset Schedule

* **Title Formatting Update**: Reddit post titles cannot be changed once posted. The existing launch post (`Daily Reddit Grid #1`) retains its launch title. Starting with **Puzzle #2** at midnight UTC (or whenever a new post is generated), all posts will automatically use the colon format:
  ```text
  Daily Reddit Grid #2: Find 4 Groups of 4!
  ```
* **Automated Reset**: The cron trigger runs at `0 0 * * *` (00:00 UTC) every night. It picks the next puzzle from the 365 pre-generated database and submits the new custom post automatically.
* **Manual Trigger (Mod Menu)**: If you ever need to trigger a post immediately:
  * Open [r/PlayGridDaily](https://www.reddit.com/r/PlayGridDaily/).
  * Click the **Mod Tools / Three-Dot Menu** on the subreddit.
  * Select **Trigger Daily Grid Post**.

---

## 3. Growth Playbook: The Sprint to 5,000 Daily Qualified Engagers (DQEs)

Reddit's Developer Funds program rewards apps based on Daily Qualified Engagers (DQEs) — users who interact with the app for at least 15 seconds or complete a game action:
* **Milestone 1 (1,000 DQEs)**: Early traction qualification.
* **Milestone 2 (5,000 DQEs)**: \$4,000 bonus milestone + recurring monthly payout tiers (scaling up to \$167,000/year).

### Growth Channel 1: The r/Devvit Showcase (Launch Day)
Post an engaging developer breakdown on `r/devvit`:
* **Title**: `Built a full NYT-style 4x4 Logic Grid game on Devvit with 365 original puzzles, streak tracking, and Gold shields: Here is what I learned`
* **Content**: Share the technical stack (React 18 + Hono + Devvit Web + Redis), your experience building interactive posts, and invite fellow creators to play a round on `r/PlayGridDaily`.

### Growth Channel 2: Targeted Subreddit Partnerships (Week 1)
Because your app is approved in the public directory, other subreddit moderators can install `grid-daily` directly into their communities with one click. Send friendly modmail inquiries to relevant communities:
* Target subreddits: `r/wordgames`, `r/puzzles`, `r/crosswords`, `r/NYTConnections`.
* **Outreach Template**:
  ```text
  Subject: Free daily interactive word puzzle for r/[SubredditName] community

  Hi [SubredditName] Mod Team,

  I built Grid Daily (an approved Reddit Devvit interactive puzzle game inspired by NYT Connections / Wordle). 
  It features 365 completely original daily 4x4 logic puzzles that embed directly inside Reddit feeds on mobile and web: no external links or offsite redirects required.

  Since your members love daily word challenges, I wanted to offer it to your community. You can install it directly from the Reddit App Directory, or we can cross-post the daily challenge thread for members to share their scores.

  Check out today's puzzle live on r/PlayGridDaily. Let me know what you think!
  ```

### Growth Channel 3: Comment Feed Viral Loops
* Every player who completes or attempts a puzzle receives a spoiler-free emoji share card (e.g. `🟩🟩🟩🟩 🟨🟨🟨🟨`).
* Pin a sticky comment on each daily post:
  ```text
  Drop your daily results below! Remember to use spoiler tags if discussing category hints.
  ```
* As users paste their colored score grids in the comments, the post gets algorithmically pushed higher in Reddit's home feeds.

---

## 4. Monetization Mechanics (Reddit Gold)

Your app is configured with three distinct monetization streams:
1. **Streak Shields (50 Gold - Consumable)**: Protects a player's streak when they fail to solve a puzzle within 4 attempts. Loss aversion drives the highest conversion rate for daily puzzle players.
2. **Obsidian Supporter Theme (300 Gold - Durable)**: Visual cosmetic flair for dedicated solvers, unlocking premium dark slate UI styling.
3. **Archive Pass (200 Gold - 30-Day Pass)**: Unlocks back-catalog puzzles from previous days.

---

## 5. Live Maintenance and Diagnostic Commands

Run these terminal commands from `c:\Users\peyog\Documents\antigravity\Open Source Projects\daily-reddit-grid`:

* **Stream live real-time server logs**:
  ```powershell
  npx devvit logs PlayGridDaily
  ```
* **Verify active installs**:
  ```powershell
  npx devvit apps list
  ```
* **Deploy an emergency hotfix**:
  ```powershell
  npm run build
  npx devvit upload
  npx devvit install PlayGridDaily
  ```

---

## 6. Summary Checklist

- [ ] Check inbox for Reddit Developer submission approval email.
- [ ] Verify `grid-daily` listing on the public Reddit App Directory.
- [ ] Connect Stripe / payout settings on `developers.reddit.com`.
- [ ] Test real Reddit Gold purchase modal on mobile app.
- [ ] Publish launch showcase post on `r/devvit` and `r/GamesOnReddit`.
- [ ] Reach out to 3 to 5 puzzle subreddits for syndication.
- [ ] Monitor Daily Qualified Engagers dashboard toward the 5,000 DQE tier.
