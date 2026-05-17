import {setUser,setLoading,setError} from "../state/auth.slice.js";
import { register,login, getMe, logout } from "../service/auth.api.js";
import { useDispatch,useSelector } from "react-redux";
import { useEffect } from "react";

export const useAuth = ()=>{

    const dispatch = useDispatch();
    
    const handleRegister = async({email,contact,password,fullname,isSeller = false})=>{

        const data = await register({email,contact,password,fullname,isSeller});
        dispatch(setUser(data.user));
        return data.user;

    }

    const handleLogin = async({email,password})=>{

        const data = await login({email,password});
        dispatch(setUser(data.user));
        return data.user;

    }

    const handleGetMe = async()=>{
       try{
        dispatch(setLoading(true));
        const data = await getMe();
        dispatch(setUser(data.user));
       }catch(error){
        dispatch(setUser(null));
        console.log(error);
       }finally{
        dispatch(setLoading(false));
       }
    }

    const handleLogout = async()=>{
        const data = await logout();
        dispatch(setUser(null));
    }


    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleLogout
    }

}
