import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createServer, getServerPort, context, reddit, redis } from '@devvit/web/server';
import { SAMPLE_PUZZLES } from './data/puzzles.js';
import { DailyPuzzle, ClientPuzzleData } from '../shared/types.js';

const app = new Hono();

// Helper: Get today's puzzle
function getTodayPuzzle(): DailyPuzzle {
  const epoch = new Date('2026-11-08T00:00:00Z').getTime();
  const now = Date.now();
  const dayIndex = Math.floor((now - epoch) / (1000 * 60 * 60 * 24));
  const puzzle = SAMPLE_PUZZLES[Math.max(0, dayIndex) % SAMPLE_PUZZLES.length];
  return puzzle;
}

// 1. GET /api/puzzle/today: Return today's sanitized grid
app.get('/api/puzzle/today', async (c) => {
  const puzzle = getTodayPuzzle();

  // Strip categories to prevent client-side inspection / cheating
  const allItems = puzzle.categories.flatMap(cat => cat.items);
  // Deterministic shuffle based on dayNumber
  const shuffled = [...allItems].sort((a, b) => {
    const hashA = (a.charCodeAt(0) * puzzle.dayNumber) % 17;
    const hashB = (b.charCodeAt(0) * puzzle.dayNumber) % 17;
    return hashA - hashB;
  });

  const clientData: ClientPuzzleData = {
    id: puzzle.id,
    dayNumber: puzzle.dayNumber,
    date: puzzle.date,
    items: shuffled
  };

  return c.json(clientData);
});

// 2. GET /api/user/profile: Get player's streak, solve count, and shields
app.get('/api/user/profile', async (c) => {
  const userId = context.userId;

  if (!userId) {
    return c.json({
      streak: 0,
      maxStreak: 0,
      totalSolves: 0,
      shields: 0,
      playedToday: false
    });
  }

  const userKey = `player:${userId}:stats`;
  const stats = (await redis.hGetAll(userKey)) || {};
  const today = new Date().toISOString().split('T')[0];

  return c.json({
    streak: parseInt(stats.streak || '0', 10),
    maxStreak: parseInt(stats.maxStreak || '0', 10),
    totalSolves: parseInt(stats.totalSolves || '0', 10),
    shields: parseInt(stats.shields || '0', 10),
    playedToday: stats.lastPlayed === today
  });
});

// 3. POST /api/puzzle/guess: Validate player guess (4 items)
app.post('/api/puzzle/guess', async (c) => {
  const userId = context.userId;
  const { guess } = await c.req.json<{ guess: string[] }>();

  if (!Array.isArray(guess) || guess.length !== 4) {
    return c.json({ error: 'Guess must contain exactly 4 items' }, 400);
  }

  const puzzle = getTodayPuzzle();
  const normalizedGuess = guess.map(g => g.trim().toUpperCase()).sort();

  // Track session attempts in Redis
  const sessionKey = userId ? `player:${userId}:session:${puzzle.date}` : `guest:session:${puzzle.date}`;
  const usedAttempts = parseInt((await redis.hGet(sessionKey, 'attempts')) || '0', 10);

  if (usedAttempts >= 4) {
    return c.json({
      correct: false,
      remainingAttempts: 0,
      solvedAll: false,
      message: 'No remaining attempts for today.'
    });
  }

  // Check matching category
  for (const cat of puzzle.categories) {
    const normCategory = cat.items.map(i => i.trim().toUpperCase()).sort();
    const isMatch = normCategory.every((val, idx) => val === normalizedGuess[idx]);

    if (isMatch) {
      return c.json({
        correct: true,
        categoryTitle: cat.title,
        categoryDifficulty: cat.difficulty,
        solvedItems: cat.items,
        remainingAttempts: Math.max(0, 4 - usedAttempts),
        solvedAll: false
      });
    }
  }

  // One-away check (3 out of 4 match a category)
  let isOneAway = false;
  for (const cat of puzzle.categories) {
    const normCategory = cat.items.map(i => i.trim().toUpperCase());
    const matchCount = normalizedGuess.filter(item => normCategory.includes(item)).length;
    if (matchCount === 3) {
      isOneAway = true;
      break;
    }
  }

  const newAttempts = await redis.hIncrBy(sessionKey, 'attempts', 1);
  await redis.expire(sessionKey, 172800); // 48h TTL
  const remaining = Math.max(0, 4 - newAttempts);

  return c.json({
    correct: false,
    remainingAttempts: remaining,
    solvedAll: false,
    message: isOneAway ? 'One away...' : undefined
  });
});

// 4. POST /api/streak/claim: Record successful daily solve
app.post('/api/streak/claim', async (c) => {
  const userId = context.userId;

  if (!userId) {
    return c.json({ error: 'User must be logged in to track streaks' }, 401);
  }

  const today = new Date().toISOString().split('T')[0];
  const userKey = `player:${userId}:stats`;
  const stats = (await redis.hGetAll(userKey)) || {};

  const currentStreak = parseInt(stats.streak || '0', 10);
  const maxStreak = parseInt(stats.maxStreak || '0', 10);
  const totalSolves = parseInt(stats.totalSolves || '0', 10);
  const lastPlayed = stats.lastPlayed || '';

  if (lastPlayed === today) {
    return c.json({
      streak: currentStreak,
      maxStreak,
      totalSolves,
      shields: parseInt(stats.shields || '0', 10),
      playedToday: true
    });
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  let newStreak = currentStreak + 1;

  if (lastPlayed !== yesterday && lastPlayed !== '') {
    const shields = parseInt(stats.shields || '0', 10);
    if (shields > 0) {
      await redis.hIncrBy(userKey, 'shields', -1);
      newStreak = currentStreak + 1;
    } else {
      newStreak = 1;
    }
  }

  const newMax = Math.max(maxStreak, newStreak);
  await redis.hSet(userKey, {
    streak: newStreak.toString(),
    maxStreak: newMax.toString(),
    totalSolves: (totalSolves + 1).toString(),
    lastPlayed: today
  });

  // Record leaderboard entry (bounded to top 500)
  const leaderboardKey = `leaderboard:${today}`;
  await redis.zAdd(leaderboardKey, { member: userId, score: newStreak });
  await redis.zRemRangeByRank(leaderboardKey, 500, -1);
  await redis.expire(leaderboardKey, 604800); // 7-day retention

  return c.json({
    streak: newStreak,
    maxStreak: newMax,
    totalSolves: totalSolves + 1,
    shields: parseInt(stats.shields || '0', 10),
    playedToday: true
  });
});

// 5. POST /api/payments/fulfill: Handle Reddit Gold purchases
app.post('/api/payments/fulfill', async (c) => {
  const { sku, userId } = await c.req.json<{ sku: string; userId: string }>();

  if (!userId || !sku) {
    return c.json({ error: 'Missing payment fulfillment fields' }, 400);
  }

  const userKey = `player:${userId}:stats`;

  if (sku === 'streak_shield_token') {
    await redis.hIncrBy(userKey, 'shields', 1);
  }

  return c.json({ success: true, sku });
});

// Helper: Submit custom interactive post
async function submitDailyGridPost(subredditName: string) {
  const puzzle = getTodayPuzzle();
  return await reddit.submitCustomPost({
    subredditName,
    title: `Daily Reddit Grid #${puzzle.dayNumber}: Find 4 Groups of 4!`,
    entry: 'default'
  });
}

// Handler for moderator context menu
app.post('/internal/mod/trigger-daily-post', async (c) => {
  const subredditName = context.subredditName || 'PlayGridDaily';

  try {
    const post = await submitDailyGridPost(subredditName);
    console.log('Created post:', post.id);
    return c.json({ showToast: "Today's Daily Grid post has been published!" });
  } catch (err: any) {
    console.error('submitCustomPost error:', err);
    return c.json({ showToast: `Error: ${err?.message || err}` });
  }
});

// Handler for automatic post creation on installation
app.post('/internal/triggers/on-app-install', async (c) => {
  const subredditName = context.subredditName;
  if (subredditName) {
    try {
      await submitDailyGridPost(subredditName);
    } catch (e) {
      console.error('Failed to auto-post on install:', e);
    }
  }
  return c.json({ success: true });
});

// Handler for daily midnight UTC cron task
app.post('/internal/scheduler/daily-puzzle-reset', async (c) => {
  const subredditName = context.subredditName;
  if (subredditName) {
    try {
      await submitDailyGridPost(subredditName);
    } catch (e) {
      console.error('Failed to post daily puzzle on cron:', e);
    }
  }
  return c.json({ success: true });
});

// Start the server using Devvit's server wrapper and port binding
serve({
  fetch: app.fetch,
  createServer,
  port: getServerPort(),
});

export default app;
