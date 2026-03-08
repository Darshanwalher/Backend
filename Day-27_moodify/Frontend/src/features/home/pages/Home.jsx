// import React from 'react';
// // Fixed typo in import name
// import FaceExpression from "../../components/FaceExpression"; 
// import Player from "../components/Player";
// import { useSong } from "../hooks/useSong";

// const Home = () => {
//     const { handleGetSong } = useSong();

//     return (
//         <>
//             {/* Component name matches the export now */}
//             <FaceExpression onClick={(mood) => handleGetSong({ mood })} />
//             <Player />
//         </>
//     );
// };

// export default Home;

import React, { useState, useEffect } from 'react';
import FaceExpression from "../../components/FaceExpression";
import Player from "../components/Player";
import { useSong } from "../hooks/useSong";
import './home.scss';

const MOOD_COLORS = {
  happy:       '#fbbf24',
  sad:         '#60a5fa',
  angry:       '#f43f5e',
  surprised:   '#a78bfa',
  fearful:     '#34d399',
  disgusted:   '#fb923c',
  neutral:     '#78716c',
  calm:        '#67e8f9',
  focused:     '#86efac',
  energetic:   '#fc814a',
  melancholic: '#c084fc',
};

const getMoodColor = (mood) =>
  MOOD_COLORS[mood?.toLowerCase()] || '#fbbf24';

// ── Mini Bar Chart ────────────────────────────────────────────────────────────
function MoodBarChart({ history }) {
  const counts = {};
  history.forEach(({ mood }) => {
    const key = mood.toLowerCase();
    counts[key] = (counts[key] || 0) + 1;
  });

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="mood-chart">
      {entries.map(([mood, count]) => (
        <div key={mood} className="mood-chart__bar-wrap">
          <div className="mood-chart__bar-track">
            <div
              className="mood-chart__bar-fill"
              style={{
                height: `${(count / max) * 100}%`,
                background: getMoodColor(mood),
                boxShadow: `0 0 8px ${getMoodColor(mood)}60`,
              }}
            />
          </div>
          <span className="mood-chart__label">{mood.slice(0, 4)}</span>
          <span className="mood-chart__count" style={{ color: getMoodColor(mood) }}>
            {count}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const Home = () => {
  const { handleGetSong, song } = useSong();

  // Load history from localStorage on mount
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('moodify_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist history to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem('moodify_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  const handleMoodDetected = (mood) => {
    handleGetSong({ mood });

    const entry = {
      id: Date.now(),
      mood,
      song: song?.title || null,   // captured at detection time; Player may update after
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
    };

    setHistory((prev) => [entry, ...prev]);
  };

  // When song changes after detection, patch the latest history entry with the song title
  useEffect(() => {
    if (!song?.title) return;
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const [latest, ...rest] = prev;
      if (latest.song) return prev;           // already has a title
      return [{ ...latest, song: song.title }, ...rest];
    });
  }, [song?.title]);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('moodify_history');
  };

  // Stats
  const totalScans   = history.length;
  const uniqueMoods  = new Set(history.map((h) => h.mood.toLowerCase())).size;
  const topMood      = (() => {
    const counts = {};
    history.forEach(({ mood }) => { const k = mood.toLowerCase(); counts[k] = (counts[k] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
  })();

  return (
    <div className="home-layout">

      {/* Shared atmospheric background */}
      <div className="home-layout__bg">
        <div className="home-layout__blob home-layout__blob--left" />
        <div className="home-layout__blob home-layout__blob--right" />
      </div>

      {/* LEFT — Scanner */}
      <div className="home-layout__left">
        <FaceExpression onClick={handleMoodDetected} />
      </div>

      {/* Gold vertical divider */}
      <div className="home-layout__divider" />

      {/* RIGHT — Player + History */}
      <div className="home-layout__right">

        {/* Player */}
        <Player />

        {/* History Panel */}
        <div className="history-panel">

          {/* Stats row */}
          <div className="history-panel__stats">
            <div className="stat-chip">
              <span className="stat-chip__value">{totalScans}</span>
              <span className="stat-chip__label">Scans</span>
            </div>
            <div className="stat-chip">
              <span className="stat-chip__value">{uniqueMoods}</span>
              <span className="stat-chip__label">Moods</span>
            </div>
            <div className="stat-chip">
              <span
                className="stat-chip__value"
                style={{ color: getMoodColor(topMood), textTransform: 'capitalize' }}
              >
                {topMood}
              </span>
              <span className="stat-chip__label">Top Mood</span>
            </div>
            {history.length > 0 && (
              <button className="stat-chip stat-chip--clear" onClick={clearHistory}>
                Clear
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="history-panel__empty">
              <span>✦</span>
              <p>Scan your mood to start tracking</p>
            </div>
          ) : (
            <>
              {/* Bar chart */}
              <div className="history-panel__section-label">Mood Frequency</div>
              <MoodBarChart history={history} />

              {/* Log */}
              <div className="history-panel__section-label" style={{ marginTop: '10px' }}>
                Recent Scans
              </div>
              <div className="history-panel__list">
                {history.map((entry) => (
                  <div key={entry.id} className="history-item">
                    <span
                      className="history-item__dot"
                      style={{
                        background: getMoodColor(entry.mood),
                        boxShadow: `0 0 6px ${getMoodColor(entry.mood)}80`,
                      }}
                    />
                    <div className="history-item__info">
                      <span className="history-item__song">
                        {entry.song || '—'}
                      </span>
                      <span
                        className="history-item__mood"
                        style={{ color: getMoodColor(entry.mood) }}
                      >
                        {entry.mood}
                      </span>
                    </div>
                    <div className="history-item__time">
                      <span>{entry.time}</span>
                      <span>{entry.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default Home;