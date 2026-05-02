import react, { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./app.routes.jsx";
import { useAuth } from "../features/auth/hook/useAuth.js";
import { useSelector } from "react-redux";

const App = () => {
    const {handleGetMe} = useAuth();

    const user = useSelector(state=>state.auth.user);
    console.log(user);
    

    useEffect(()=>{
        handleGetMe();
    },[])
    
    return (
        <>
            <RouterProvider router={router} />
        </>
    );
};

export default App;