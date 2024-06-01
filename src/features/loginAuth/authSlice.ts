import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";

interface AuthSate {
  token: string | null;
  roles: string[];
  isAuthenticated: boolean;
  username: string | null;
  userId: number | null;
}

const token = Cookies.get("token") || null;
const roles = Cookies.get("roles")
  ? JSON.parse(Cookies.get("roles") as string)
  : [];
const username = Cookies.get("username") || null;
const storedUserId = Cookies.get("userId") || null;

// Utility function to check if the token is expired'
const isTokenExpired = (token: string | null) => {
  if (!token) return true;
  const payload = JSON.parse(atob(token.split(".")[1]));
  const exp = payload.exp * 1000;
  return Date.now() >= exp;
};

const initialState: AuthSate = {
  token,
  roles,
  isAuthenticated: !!token && !isTokenExpired(token),
  username: username || null,
  userId: storedUserId ? parseInt(storedUserId) : null,
};

// Async thunk to verify the token
export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get("/api/verifyToken");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: "Token verification failed" });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(
      state,
      action: PayloadAction<{
        token: string;
        roles: string[];
        username: string;
        userId: number;
      }>
    ) {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.roles = action.payload.roles;
      state.username = action.payload.username;
      state.userId = action.payload.userId;
      Cookies.set("token", action.payload.token, {
        secure: true,
        sameSite: "Strict",
      });
      Cookies.set("roles", JSON.stringify(action.payload.roles), {
        secure: true,
        sameSite: "Strict",
      });
      Cookies.set("username", action.payload.username, {
        secure: true,
        sameSite: "Strict",
      });
      Cookies.set("userId", action.payload.userId.toString(), {
        secure: true,
        sameSite: "Strict",
      });
    },
    logout(state) {
      state.isAuthenticated = false;
      state.token = null;
      state.roles = [];
      state.username = null;
      state.userId = null;
      Cookies.remove("token");
      Cookies.remove("roles");
      Cookies.remove("username");
      Cookies.remove("userId");
    },
    setAuth(state, action: PayloadAction<boolean>) {
      state.isAuthenticated = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(verifyToken.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.username = action.payload.username;
      state.roles = action.payload.roles;
    });
    builder.addCase(verifyToken.rejected, (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.roles = [];
      state.username = null;
      state.userId = null;
    });
  },
});

export const { login, logout, setAuth } = authSlice.actions;
export default authSlice.reducer;
