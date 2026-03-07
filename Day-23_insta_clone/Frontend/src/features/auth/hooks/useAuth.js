// import { useContext, useEffect } from "react";
// import { AuthContext } from "../auth.context.jsx";
// import {loginUser, registerUser,getMeUser} from "../services/auth.api";


// export const useAuth = ()=>{
//     const context = useContext(AuthContext);
//     const { user,setUser, loading, setLoading } = context;

//     const handleLogin = async (username,password) =>{
//         setLoading(true);

//         const response = await loginUser(username,password);
//         setUser(response.user);
//         setLoading(false);
//         return response.user;
//     }

//     const handleRegister = async (username,email,password) =>{
//         setLoading(true);

//         const response = await registerUser(username,email,password);
//         setUser(response.user);
//         setLoading(false);
//         return response.user;
//     }

//     // const handleGetMe = async () =>{
//     //     setLoading(true);

//     //     const response = await getMeUser();

//     //     return response.user;
//     // }

//     // GET CURRENT USER
//     const handleGetMe = async () => {
//         try {
//             setLoading(true);

//             const response = await getMeUser();

//             setUser(response.user);

//             return response.user;

//         } catch (error) {

//             console.error("Auth Error:", error);

//             setUser(null);

//             // redirect only here if token expired
//             navigate("/login");

//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         handleGetMe();
//     }, []);


//     return {
//         user,
//         loading,
//         handleLogin,
//         handleRegister,
//         handleGetMe
//     }
// }

import { use, useContext, useEffect } from "react";
import { AuthContext } from "../auth.context.jsx";
import { loginUser, registerUser, getMeUser } from "../services/auth.api";
import { useNavigate } from "react-router";

export const useAuth = () => {

    const context = useContext(AuthContext);
    const navigate = useNavigate();

    const { user, setUser, loading, setLoading } = context;

    // LOGIN
    const handleLogin = async (username, password) => {
        try {
            setLoading(true);

            const response = await loginUser(username, password);

            setUser(response.user);

            return response.user;

        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // REGISTER
    const handleRegister = async (username, email, password) => {
        try {
            setLoading(true);

            const response = await registerUser(username, email, password);

            setUser(response.user);

            return response.user;

        } catch (error) {
            console.error("Register Error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // GET CURRENT USER
    const handleGetMe = async () => {
        try {
            setLoading(true);

            const response = await getMeUser();

            setUser(response.user);

            return response.user;

        } catch (error) {

            console.error("Auth Error:", error);

            setUser(null);

            // redirect only here if token expired
            navigate("/login");

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleGetMe();
    }, []);


    return {
        user,
        loading,
        handleLogin,
        handleRegister,
        handleGetMe
    };
};