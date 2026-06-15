import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// GET /api/auth/me
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.message || 'Failed to fetch user');
      }
      const data = await response.json();
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// POST /api/auth/login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return rejectWithValue(data.message || 'Invalid credentials');
      }
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// POST /api/auth/register
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (details, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(details),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return rejectWithValue(data.message || 'Registration failed');
      }
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// POST /api/auth/logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return rejectWithValue(data.message || 'Logout failed');
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCurrentUser
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'failed';
        state.user = null;
        state.isAuthenticated = false;
        // If the user has no token (not logged in yet), don't set an error message
        // since it is the expected initial state, not an actual application failure.
        if (action.payload && action.payload !== 'Authentication token is missing') {
          state.error = action.payload;
        }
        localStorage.removeItem('sandboxState');
        localStorage.removeItem('sandboxId');
        localStorage.removeItem('previewUrl');
        localStorage.removeItem('openTabs');
        localStorage.removeItem('activeTab');
        localStorage.removeItem('chatMessages');
      })
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // logoutUser
      .addCase(logoutUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = 'idle';
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        localStorage.removeItem('sandboxState');
        localStorage.removeItem('sandboxId');
        localStorage.removeItem('previewUrl');
        localStorage.removeItem('openTabs');
        localStorage.removeItem('activeTab');
        localStorage.removeItem('chatMessages');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
