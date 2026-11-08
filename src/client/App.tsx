import React, { useState, useEffect, useCallback } from 'react';
import { ClientPuzzleData, GuessResponse, UserProfile } from '../shared/types.js';

const DIFFICULTY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  easy: { bg: '#ca8a04', border: '#eab308', text: '#000000' },    // Yellow
  medium: { bg: '#16a34a', border: '#22c55e', text: '#ffffff' },  // Green
  hard: { bg: '#2563eb', border: '#3b82f6', text: '#ffffff' },    // Blue
  expert: { bg: '#9333ea', border: '#a855f7', text: '#ffffff' }   // Purple
};

export const App: React.FC = () => {
  const [puzzle, setPuzzle] = useState<ClientPuzzleData | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [solvedCategories, setSolvedCategories] = useState<{
    title: string;
    items: string[];
    difficulty?: string;
  }[]>([]);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number>(4);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [gameStatus, setGameStatus] = useState<'LOADING' | 'PLAYING' | 'WON' | 'LOST'>('LOADING');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [historyRows, setHistoryRows] = useState<string[]>([]);

  // Show temporary toast message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Initial load
  useEffect(() => {
    async function loadData() {
      try {
        const [puzzleRes, profileRes] = await Promise.all([
          fetch('/api/puzzle/today'),
          fetch('/api/user/profile')
        ]);

        if (puzzleRes.ok) {
          const pData: ClientPuzzleData = await puzzleRes.json();
          setPuzzle(pData);
        }
        if (profileRes.ok) {
          const uData: UserProfile = await profileRes.json();
          setUserProfile(uData);
        }
      } catch (err) {
        console.error('Offline fallback loading:', err);
        // Fallback demo data
        setPuzzle({
          id: 'puzzle-fallback',
          dayNumber: 1,
          date: new Date().toISOString().split('T')[0],
          items: [
            'NOLAN', 'TARANTINO', 'SCORSESE', 'SPIELBERG',
            'CLOSEUP', 'PAN', 'DOLLY', 'TILT',
            'BOOKKEEPER', 'BALLOON', 'COFFEE', 'COMMITTEE',
            'KNIGHT', 'PSALM', 'WRIST', 'GNOME'
          ]
        });
      } finally {
        setGameStatus('PLAYING');
      }
    }
    loadData();
  }, []);

  // Selection toggle
  const toggleSelect = useCallback((item: string) => {
    if (gameStatus !== 'PLAYING') return;
    setSelectedItems(prev => {
      if (prev.includes(item)) return prev.filter(i => i !== item);
      if (prev.length >= 4) return prev;
      return [...prev, item];
    });
  }, [gameStatus]);

  // Guess submission
  const submitGuess = async () => {
    if (selectedItems.length !== 4 || gameStatus !== 'PLAYING') return;

    try {
      const res = await fetch('/api/puzzle/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess: selectedItems })
      });

      if (!res.ok) {
        showToast('Error validating guess');
        return;
      }

      const result: GuessResponse = await res.json();

      if (result.correct && result.categoryTitle && result.solvedItems) {
        const newSolved = [
          ...solvedCategories,
          {
            title: result.categoryTitle,
            items: result.solvedItems,
            difficulty: result.categoryDifficulty
          }
        ];
        setSolvedCategories(newSolved);
        setSelectedItems([]);
        setHistoryRows(prev => [...prev, '🟩🟩🟩🟩']);

        if (newSolved.length === 4) {
          setGameStatus('WON');
          claimStreak();
        }
      } else {
        setAttemptsRemaining(result.remainingAttempts);
        setHistoryRows(prev => [...prev, '🟨🟨⬜🟨']);
        setSelectedItems([]);

        if (result.message) {
          showToast(result.message);
        }

        if (result.remainingAttempts <= 0) {
          setGameStatus('LOST');
        }
      }
    } catch {
      showToast('Network error, check connection');
    }
  };

  // Streak claim
  const claimStreak = async () => {
    try {
      const res = await fetch('/api/streak/claim', { method: 'POST' });
      if (res.ok) {
        const updated: UserProfile = await res.json();
        setUserProfile(updated);
      }
    } catch (err) {
      console.error('Streak claim error:', err);
    }
  };

  // Copy Wordle-style share result
  const copyShareResult = () => {
    const dayNum = puzzle?.dayNumber || 1;
    const streak = userProfile?.streak || 1;
    const emojiBlock = historyRows.join('\n');
    const statusLine = gameStatus === 'WON' 
      ? `Solved with ${4 - attemptsRemaining} misses!` 
      : 'Defeated by the grid!';

    const text = `Reddit Connections #${dayNum} 🔥 ${streak} Day Streak\n${statusLine}\n\n${emojiBlock}\n\nPlay today's game on Reddit!`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (gameStatus === 'LOADING') {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: '#f97316', fontWeight: 'bold' }}>Loading Daily Grid...</p>
      </div>
    );
  }

  // Filter out already-solved items from grid
  const solvedItemSet = new Set(solvedCategories.flatMap(c => c.items));
  const remainingItems = puzzle ? puzzle.items.filter(item => !solvedItemSet.has(item)) : [];

  return (
    <div style={{ maxWidth: '440px', margin: '0 auto', padding: '16px', minHeight: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      
      {/* Top Bar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #1f2937' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f97316', letterSpacing: '0.05em' }}>DAILY GRID</h1>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Puzzle #{puzzle?.dayNumber} • {puzzle?.date}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ background: '#111827', border: '1px solid #374151', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' }}>
            🔥 {userProfile?.streak || 0}
          </div>
          <div style={{ background: '#111827', border: '1px solid #374151', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: '#f87171' }}>
            ❤️ {attemptsRemaining}
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ margin: '8px 0', padding: '8px 12px', background: '#374151', color: '#fef08a', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
          {toastMessage}
        </div>
      )}

      {/* Solved Categories Display */}
      <div style={{ margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {solvedCategories.map((cat, idx) => {
          const colors = DIFFICULTY_COLORS[cat.difficulty || 'medium'] || DIFFICULTY_COLORS.medium;
          return (
            <div key={idx} style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text, padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat.title}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '2px' }}>{cat.items.join(', ')}</div>
            </div>
          );
        })}
      </div>

      {/* Main 4x4 Tiles Grid */}
      {gameStatus === 'PLAYING' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', flexGrow: 1, margin: '12px 0' }}>
          {remainingItems.map((item, idx) => {
            const isSelected = selectedItems.includes(item);
            return (
              <button
                key={idx}
                onClick={() => toggleSelect(item)}
                style={{
                  height: '70px',
                  padding: '6px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  border: isSelected ? '2px solid #fdba74' : '1px solid #374151',
                  background: isSelected ? '#ea580c' : '#1f2937',
                  color: isSelected ? '#ffffff' : '#f3f4f6',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}
              >
                {item}
              </button>
            );
          })}
        </div>
      )}

      {/* Victory / Defeat Modal */}
      {(gameStatus === 'WON' || gameStatus === 'LOST') && (
        <div style={{ margin: 'auto 0', padding: '24px', background: '#111827', border: '1px solid #374151', borderRadius: '12px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '8px', color: gameStatus === 'WON' ? '#4ade80' : '#f87171' }}>
            {gameStatus === 'WON' ? '🎉 PUZZLE COMPLETED!' : '💀 OUT OF TRIES!'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '16px' }}>
            {gameStatus === 'WON'
              ? `Your ${userProfile?.streak || 1} day streak is secured! Next puzzle at 00:00 UTC.`
              : 'Better luck tomorrow. Next puzzle unlocks at 00:00 UTC.'}
          </p>

          <button
            onClick={copyShareResult}
            style={{
              width: '100%',
              padding: '14px',
              background: '#f97316',
              color: '#030712',
              fontWeight: 900,
              fontSize: '1rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '8px'
            }}
          >
            {copied ? '✅ COPIED TO CLIPBOARD!' : '📋 SHARE RESULT TO COMMENTS'}
          </button>
          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Paste into the Reddit post comments to share your spoiler-free grid!
          </p>
        </div>
      )}

      {/* Control Buttons Footer */}
      {gameStatus === 'PLAYING' && (
        <footer style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid #1f2937' }}>
          <button
            onClick={() => setSelectedItems([])}
            disabled={selectedItems.length === 0}
            style={{
              flex: 1,
              padding: '12px',
              background: '#1f2937',
              border: '1px solid #374151',
              color: '#d1d5db',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: selectedItems.length > 0 ? 'pointer' : 'not-allowed',
              opacity: selectedItems.length > 0 ? 1 : 0.4
            }}
          >
            Deselect All
          </button>
          <button
            onClick={submitGuess}
            disabled={selectedItems.length !== 4}
            style={{
              flex: 2,
              padding: '12px',
              background: '#f97316',
              border: 'none',
              color: '#030712',
              borderRadius: '8px',
              fontWeight: 900,
              cursor: selectedItems.length === 4 ? 'pointer' : 'not-allowed',
              opacity: selectedItems.length === 4 ? 1 : 0.4
            }}
          >
            Submit ({selectedItems.length}/4)
          </button>
        </footer>
      )}
    </div>
  );
};
