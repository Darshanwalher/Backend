import React from 'react'
import AppRoutes from './AppRoutes'
import { AuthProvider } from './features/auth/auth.context.jsx'

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
