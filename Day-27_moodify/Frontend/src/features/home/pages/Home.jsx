import React from 'react';
// Fixed typo in import name
import FaceExpression from "../../components/FaceExpression"; 
import Player from "../components/Player";
import { useSong } from "../hooks/useSong";

const Home = () => {
    const { handleGetSong } = useSong();

    return (
        <>
            {/* Component name matches the export now */}
            <FaceExpression onClick={(mood) => handleGetSong({ mood })} />
            <Player />
        </>
    );
};

export default Home;

