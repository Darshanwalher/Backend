import React, { useEffect } from 'react'
import useAuth from '../hook/useAuth'
import { useSelector } from "react-redux"
import { Navigate } from 'react-router-dom'

const Protected = ({ children }) => {
    const auth = useAuth()
    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)

    useEffect(() => {
        auth.handleGetMe()  // ← rehydrates user from cookie on every mount/refresh
    }, [])

    if (loading) {
        return <h1>Loading.....</h1>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default Protected
