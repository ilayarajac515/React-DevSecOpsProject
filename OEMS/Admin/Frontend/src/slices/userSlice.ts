import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";

interface UserState {
  name: string | null;
  email: string | null;
  isLoggedIn: boolean | null;
  isAuthenticated: boolean | null;
}

const initialState: UserState = {
  name: null,
  email: null,
  isAuthenticated: null,
  isLoggedIn: null,
};

export const login = createAsyncThunk(
  "user/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post<{
        name: string;
        accessToken: any;
        email: string;
      }>("/login", credentials, { withCredentials: true });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

export const logout = createAsyncThunk(
  "user/logout",
  async (email: string, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/logout", { email }, { withCredentials: true });
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Logout failed");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUser: (state) => {
      state.name = null;
      state.email = null;
      state.isAuthenticated = false;
      state.isLoggedIn = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        localStorage.setItem("accessToken", action.payload.accessToken);
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.isLoggedIn = true;
        const local = localStorage.getItem("accessToken");
        if (local) {
          state.isAuthenticated = true;
        }
      })
      .addCase(login.rejected, (state) => {
        state.isAuthenticated = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.name = null;
        localStorage.removeItem("accessToken");
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
