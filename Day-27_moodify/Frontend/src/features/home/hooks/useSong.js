import { getSong } from "../services/song.api";
import { useContext } from "react";
import { SongContext } from "../song.context";

// 1. Removed 'async' from here
export const useSong = () => { 
    const context = useContext(SongContext);

    // Ensure context isn't null if the Provider is missing
    if (!context) {
        throw new Error("useSong must be used within a SongProvider");
    }

    const { song, setSong, loading, setLoading } = context;

    // 2. Keep this async, as it handles the API call
    async function handleGetSong({ mood }) {
        try {
            setLoading(true);
            const data = await getSong({ mood });
            setSong(data.songs);
        } catch (error) {
            console.error("Failed to fetch songs:", error);
        } finally {
            setLoading(false);
        }
    }

    return { loading, song, handleGetSong };
}