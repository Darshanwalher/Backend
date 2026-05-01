import { createBrowserRouter } from "react-router";
import App from "./App.jsx";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login.jsx";
import CreateProduct from "../features/products/pages/CreateProduct.jsx";

export const router = createBrowserRouter([
    {
        path:"/",
        element:<h1> hello world</h1>,
        
    },
    {
        path:"/register",
        element:<Register/>,
    },
    {
        path:"/login",
        element:<Login/>,
    },
    {
        path:"/seller/create-product",
        element:<CreateProduct/>,
    }
])  