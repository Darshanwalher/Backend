import React from 'react'
import { RouterProvider } from 'react-router-dom'
import {router} from "./app.routes.jsx"
import "./features/shared/styles/global.scss"
import { AuthContextProvider } from './features/auth/auth.context.jsx'


const App = () => {
  return (
   <AuthContextProvider>
    <RouterProvider router={router}/>
   </AuthContextProvider>
  )
}

export default App
