// import React from 'react'
// import { useAuth } from '../hooks/useAuth'
// import { Navigate } from 'react-router-dom';

// const Protected = ({children}) => {
//     const {user,loading} = useAuth();


//     if(loading){
//         return <h1>Loading</h1>
//     }

//     if(!user){
//         return <Navigate to="/login"/>
//     }
//   return children;
// }

// export default Protected

import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import "./loader.scss";

const Protected = ({ children }) => {

  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-container">
          <div className="logo">🎧</div>

          <div className="equalizer">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <p>Loading your vibe...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default Protected;