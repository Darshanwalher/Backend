import { useDispatch } from "react-redux"
import { register, login, getMe, logOut } from "../services/auth.api.js"
import { setUser, setLoading, setError } from "../auth.slice.js"

/**
 * useAuth — Custom hook that manages all authentication operations.
 *
 * Wraps register, login, getMe, and logout API calls.
 * All state changes (user, loading, error) are pushed to Redux via dispatch.
 *
 * Returns an object of handler functions consumed by:
 *  - Register.jsx     → handleRegister
 *  - Login.jsx        → handleLogin
 *  - Protected.jsx    → handleGetMe  (rehydrates user on page refresh)
 *  - Dashboard.jsx    → handleLogOut
 */
export function useAuth() {

    const dispatch = useDispatch();

    /**
     * handleRegister — Registers a new user account.
     *
     * Flow:
     *  1. Calls the register API with email, password, username
     *  2. On success, does NOT log the user in — email must be verified first
     *  3. Returns a success flag and message for the UI to show
     *  4. On failure, stores the error in Redux and returns it to the caller
     *  5. Always turns off loading in finally
     *
     * Why not login after register?
     *  The backend sends a verification email. The user must click the link
     *  before their account is active. Logging them in before verification
     *  would bypass that check.
     *
     * @param {string} email
     * @param {string} password
     * @param {string} username
     * @returns {{ success: boolean, message: string }}
     */
    async function handleRegister({ email, password, username }) {
        try {
            dispatch(setLoading(true));

            await register({ email, password, username });

            // Explicitly clear user — do not set the registered user as logged in
            dispatch(setUser(null));

            return {
                success: true,
                message: "Please verify your email. Check your inbox."
            };
        }
        catch (error) {
            // Extract backend error message, fall back to a generic string
            const message = error.response?.data?.message || "Registration Failed";

            dispatch(setError(message));

            // Return the error to the component so it can display it locally
            return { success: false, message };
        }
        finally {
            // Always stop loading — whether success or failure
            dispatch(setLoading(false));
        }
    }

    /**
     * handleLogin — Logs in an existing user with email and password.
     *
     * Flow:
     *  1. Calls the login API
     *  2. On success, stores the user object in Redux (triggers Protected to allow access)
     *  3. Returns { success: true } so Login.jsx can navigate to "/"
     *  4. On failure, stores error in Redux — but Login.jsx uses local formError
     *     to display it (avoids showing stale errors from other operations)
     *  5. Always turns off loading in finally
     *
     * Why return { success, message } instead of just dispatching?
     *  The component (Login.jsx) needs to know if it should navigate or show an error.
     *  Redux state updates are async — checking them immediately after dispatch is unreliable.
     *
     * @param {string} email
     * @param {string} password
     * @returns {{ success: boolean, message?: string }}
     */
    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true));

            const data = await login({ email, password });

            // Store the authenticated user in Redux — Protected will now allow access
            dispatch(setUser(data.user));

            return { success: true };
        }
        catch (error) {
            const message = error.response?.data?.message || "Login Failed";

            dispatch(setError(message));

            // Return message so Login.jsx can set its local formError state
            return { success: false, message };
        }
        finally {
            dispatch(setLoading(false));
        }
    }

    /**
     * handleGetMe — Fetches the currently logged-in user using the httpOnly cookie.
     *
     * Called by Protected.jsx on every mount/page refresh to rehydrate the user
     * from the server session. This is necessary because Redux state is in-memory
     * and resets on every refresh — the cookie persists but the state does not.
     *
     * Flow:
     *  1. Sets loading true (Protected shows a loading screen while this runs)
     *  2. Calls GET /api/auth/get-me — backend reads the httpOnly cookie
     *  3. On success, stores the user in Redux → Protected renders the app
     *  4. On failure (no cookie / expired), silently clears error
     *     — we do NOT dispatch an error message here because Login.jsx would
     *       pick it up and display "Unauthorized" on the login page (a past bug)
     *  5. Always turns off loading so Protected stops showing the loading screen
     *
     * @returns {void}
     */
    async function handleGetMe() {
        try {
            dispatch(setLoading(true));

            const data = await getMe();

            // User is authenticated — store them in Redux
            dispatch(setUser(data.user));
        }
        catch (error) {
            // Silently fail — if cookie is missing/expired, user stays null
            // and Protected will redirect to /login naturally.
            // Do NOT dispatch setError here — it would bleed into Login.jsx
            // and show "Unauthorized" even before the user tries to log in.
            dispatch(setError(null));
        }
        finally {
            // Must always run — if loading stays true, Protected shows infinite loading screen
            dispatch(setLoading(false));
        }
    }

    /**
     * handleLogOut — Logs out the current user.
     *
     * Flow:
     *  1. Calls the logout API — backend clears the httpOnly cookie
     *  2. Clears the user from Redux state
     *  3. Dashboard.jsx then calls navigate('/login') after this resolves
     *  4. On failure, stores the error message in Redux
     *  5. Always turns off loading in finally
     *
     * Why clear the cookie server-side?
     *  The auth cookie is httpOnly — JavaScript cannot delete it directly.
     *  The backend must call res.clearCookie('token') to remove it.
     *
     * @returns {void}
     */
    async function handleLogOut() {
        try {
            dispatch(setLoading(true));

            await logOut(); // backend clears the httpOnly cookie

            // Remove user from Redux — Protected will redirect to /login
            dispatch(setUser(null));

        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Failed to log out"));
        }
        finally {
            dispatch(setLoading(false));
        }
    }

    return {
        handleRegister, // Register a new account
        handleLogin,    // Log in with email + password
        handleGetMe,    // Rehydrate user from cookie on page refresh
        handleLogOut,   // Log out and clear session
    }
}

export default useAuth