import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<h1>Welcome to the App</h1>} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
