import React from 'react'
import { RouterProvider } from 'react-router'   // ✅ FIXED
import { router } from "./app.routes"
import "./features/shared/global.scss"
import { AuthProvider } from './features/auth/auth.context'
import { PostContext, PostContextProvider } from './features/post/post.context'

const App = () => {
  return (
    <AuthProvider>
      <PostContextProvider>
        <RouterProvider router={router} />
      </PostContextProvider>
    </AuthProvider>
  )
}

export default App