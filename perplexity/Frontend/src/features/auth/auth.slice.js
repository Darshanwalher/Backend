import { createSlice } from "@reduxjs/toolkit";

/**
 * authSlice — Redux slice for managing authentication state.
 *
 * Holds the currently logged-in user, a loading flag, and any auth error.
 * All auth state changes (login, logout, getMe) flow through these reducers.
 *
 * State shape:
 * {
 *   user:    object | null   — the logged-in user ({ id, username, email }), null if not logged in
 *   loading: boolean         — true while any auth operation is in progress (login, getMe, logout)
 *   error:   string | null   — error message from the last failed auth operation, null if no error
 * }
 */
const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,     // No user logged in by default
        loading: true,  // Start as true so Protected route waits for getMe() to finish on page refresh
        error: null     // No error on startup
    },
    reducers: {

        /**
         * setUser — Sets or clears the logged-in user.
         *
         * Called after:
         *  - Successful login       → payload is the user object
         *  - Successful getMe       → payload is the user object
         *  - Logout                 → payload is null (clears the user)
         *
         * @param {object | null} action.payload — user object or null
         */
        setUser: (state, action) => {
            state.user = action.payload
        },

        /**
         * setLoading — Sets the loading flag on or off.
         *
         * Set to true at the start of any async auth operation (login, register, getMe, logout).
         * Set to false in the finally block once the operation completes (success or failure).
         *
         * Used by:
         *  - Protected component — shows a loading screen while getMe() runs on refresh
         *  - Login/Register pages — disables the submit button while request is in flight
         *
         * @param {boolean} action.payload — true to show loading, false to hide
         */
        setLoading: (state, action) => {
            state.loading = action.payload
        },

        /**
         * setError — Sets or clears the auth error message.
         *
         * Set to an error string when an auth operation fails (e.g. wrong password, unauthorized).
         * Set to null to clear the error (e.g. on Login page mount, before a new attempt).
         *
         * Note: Login.jsx uses local formError state instead of this for displaying login errors,
         * to avoid showing errors from unrelated operations (like a failed getMe on page load).
         *
         * @param {string | null} action.payload — error message string, or null to clear
         */
        setError: (state, action) => {
            state.error = action.payload
        }
    }
})

// Export individual action creators for use in useAuth hook and components
export const { setUser, setLoading, setError } = authSlice.actions

// Export the reducer to be registered in the Redux store
export default authSlice.reducer