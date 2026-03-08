import { getSong } from "../services/song.api";
import { useContext } from "react";
import { SongContext } from "../song.context";

export const useSong = () => {
  const context = useContext(SongContext);

  // Ensure context isn't null if the Provider is missing
  if (!context) {
    throw new Error("useSong must be used within a SongProvider");
  }

  const {
    song,
    setSong,
    loading,
    setLoading,
    currentMood,
    setCurrentMood,
    recordPlay,
  } = context;

  // Fetch a new song for the detected mood.
  async function handleGetSong({ mood }) {
    try {
      setLoading(true);
      setCurrentMood(mood);
      const data = await getSong({ mood });
      setSong(data.songs);
    } catch (error) {
      console.error("Failed to fetch songs:", error);
    } finally {
      setLoading(false);
    }
  }

  return { loading, song, currentMood, handleGetSong, recordPlay };
};