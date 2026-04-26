import {setUser,setLoading,setError} from "../state/auth.slice.js";
import { register } from "../service/auth.api.js";
import { useDispatch,useSelector } from "react-redux";

export const useAuth = ()=>{

    const dispatch = useDispatch();
    
    const handleRegister = async({email,contact,password,fullname,isSeller = false})=>{

        const data = await register({email,contact,password,fullname,isSeller});
        dispatch(setUser(data));

    }

    return {
        handleRegister
    }

}
