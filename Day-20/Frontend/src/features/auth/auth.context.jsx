import React, { createContext, useState } from 'react'
import {login,register,getMe} from "./services/auth.api"

export const AuthContext = createContext()

export const AuthProvider = ({children}) =>{
    const [user, setUser] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = async(username,password,email)=>{
        setLoading(true);
        try{
            const response = await login(username,password,email)
            setUser(response.user);
        }
        catch(err){
            throw err;
        }
        finally{
            setLoading(false);
        }
    }

    const handleRegister = async(username,password,email)=>{
        setLoading(true);
        try{
            const response = await register(username,password,email)
            setUser(response.user);
        }
        catch(err){
            throw err;
        }
        finally{
            setLoading(false);
        }
    }

    return (
        <AuthContext.Provider value={{handleLogin,handleRegister,user,loading}}>
            {children}
        </AuthContext.Provider>
    )
}


