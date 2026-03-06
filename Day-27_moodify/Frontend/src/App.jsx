import React from 'react'
import { RouterProvider } from 'react-router-dom'
import {router} from "./app.routes.jsx"
import "./features/shared/styles/global.scss"
import { AuthContextProvider } from './features/auth/auth.context.jsx'
import { SongContextProvider } from './features/home/song.context.jsx'


const App = () => {
  return (
   <AuthContextProvider>
    <SongContextProvider>
      <RouterProvider router={router}/>
    </SongContextProvider>
   </AuthContextProvider>
  )
}

export default App
