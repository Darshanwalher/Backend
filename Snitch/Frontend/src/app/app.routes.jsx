import { createBrowserRouter } from "react-router";
import App from "./App.jsx";
import Register from "../features/auth/pages/Register";

export const router = createBrowserRouter([
    {
        path:"/",
        element:<h1> hello world</h1>,
        children:[
            {
                path:"/register",
                element:<Register/>,
            }
        ]
    }
])  