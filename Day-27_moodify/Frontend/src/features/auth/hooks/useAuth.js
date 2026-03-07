// import {login,register,logout,getMe} from "../services/auth.api"
// import { useContext, useEffect } from "react"
// import { AuthContext } from "../auth.context.jsx"

// export const useAuth =()=>{
//     const context = useContext(AuthContext)

//     const {user,setUser,loading,setLoading} = context

//     async function handleRegister({email,password,username}){
//         setLoading(true)
//         const data = await register({email,password,username})
//         setUser(data.user)
//         setLoading(false)
//     }

//     async function handleLogin({email,password,username}){
//         setLoading(true)
//         const data = await login({email,password,username})
//         setUser(data.user)
//         setLoading(false)
//     }

//     async function handleGetMe(){
//         setLoading(true)
//         const data = await getMe()
//         setUser(data.user)
//         setLoading(false)
//     }

//     async function handleLogout(params) {
//         setLoading(true);
//         const data = await logout();
//         setUser(null);
//         setLoading(false);
//     }

//     useEffect(()=>{
//         handleGetMe()
//     },[])

//     return {
//         user,
//         setUser,
//         loading,
//         setLoading,
//         handleRegister,
//         handleLogin,
//         handleGetMe,
//         handleLogout
//     }

// }

import { login, register, logout, getMe } from "../services/auth.api";
import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context.jsx";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {

    const context = useContext(AuthContext);
    const navigate = useNavigate();

    const { user, setUser, loading, setLoading } = context;

    // Register
    async function handleRegister({ email, password, username }) {
        try {
            setLoading(true);

            const data = await register({ email, password, username });

            setUser(data.user);

            navigate("/");

        } catch (error) {
            console.error("Register error:", error);
        } finally {
            setLoading(false);
        }
    }

    // Login
    async function handleLogin({ email, password }) {
        try {
            setLoading(true);

            const data = await login({ email, password });

            setUser(data.user);

            navigate("/");

        } catch (error) {
            console.error("Login error:", error);
        } finally {
            setLoading(false);
        }
    }

    // Get current user
    async function handleGetMe() {
        try {
            setLoading(true);

            const data = await getMe();

            setUser(data.user);

        } catch (error) {

            // Token expired or invalid
            console.error("Auth error:", error);

            setUser(null);


        } finally {
            setLoading(false);
        }
    }

    // Logout
    async function handleLogout() {
        try {
            setLoading(true);

            await logout();

            setUser(null);

            navigate("/login");

        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setLoading(false);
        }
    }

    // Run on app load
    useEffect(() => {
        handleGetMe();
    }, []);

    return {
        user,
        setUser,
        loading,
        setLoading,
        handleRegister,
        handleLogin,
        handleGetMe,
        handleLogout
    };
};