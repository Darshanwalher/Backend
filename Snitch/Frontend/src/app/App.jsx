import react from "react";
import { RouterProvider } from "react-router";
import { router } from "./app.routes.js";

const App = () => {
    return (
        <RouterProvider router={router}/>
    );
};

export default App;