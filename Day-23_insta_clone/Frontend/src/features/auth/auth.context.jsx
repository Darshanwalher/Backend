// import { Children, createContext,useState } from "react";

// export const AuthContext = createContext();

// export const AuthProvider = ({children}) => {

//     const [user, setUser] = useState(null)
//     const [loading, setLoading] = useState(false)

//     return (
//         <AuthContext.Provider value={{user, setUser, loading, setLoading}}>
//             {children}
//         </AuthContext.Provider>
//     )
// }

import { createContext, useState, useEffect } from "react";
import { getMeUser } from "./services/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleGetMe = async () => {
        try {
            const response = await getMeUser();
            setUser(response.user);
        } catch (error) {
            console.error("Auth Error:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // 🔥 Runs when app starts
    useEffect(() => {
        handleGetMe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
};