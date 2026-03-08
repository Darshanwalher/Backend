import { createContext, useState } from "react";

const HISTORY_STORAGE_KEY = "moodify_song_history";

export const SongContext = createContext();

export const SongContextProvider = ({ children }) => {
  const [song, setSong] = useState({
    url: "https://ik.imagekit.io/hnoglyswo0/cohort-2/moodify/songs/Lady_Singham_gs01DFz-1.mp3",
    posterUrl: "https://ik.imagekit.io/hnoglyswo0/cohort-2/moodify/posters/Lady_Singham_VW8DGJkie.jpeg",
    title: "Lady Singham",
    mood: "happy",
  });

  const [loading, setLoading] = useState(false);
  const [currentMood, setCurrentMood] = useState("happy");

  const [history, setHistory] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const recordPlay = ({ song, requestedMood }) => {
    if (!song) return;

    const entry = {
      id: `${song.url}-${Date.now()}`,
      playedAt: new Date().toISOString(),
      requestedMood,
      songMood: song.mood,
      song: {
        title: song.title,
        url: song.url,
        posterUrl: song.posterUrl,
        mood: song.mood,
      },
    };

    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, 50);

      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage failures (e.g., private mode)
      }

      return next;
    });
  };

  return (
    <SongContext.Provider
      value={{
        song,
        setSong,
        loading,
        setLoading,
        currentMood,
        setCurrentMood,
        recordPlay,
        history,
      }}
    >
      {children}
    </SongContext.Provider>
  );
};