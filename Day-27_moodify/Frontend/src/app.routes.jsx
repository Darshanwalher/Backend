import {createBrowserRouter} from "react-router-dom"
import Login from "./features/auth/pages/Login"
import Register from "./features/auth/pages/Register"
import Protected from "./features/auth/components/Protected"
import Home from "./features/home/pages/Home"

export const router = createBrowserRouter([
    {
        path:"/home",
        element: <Protected>
           <Home />
        </Protected>
    },
    {
        path:"/",
        element: <Login />
    },
    {
        path:"/register",
        element: <Register />
    }
])

