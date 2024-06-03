import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import crypto from "crypto-js";

const COOKIE_SECRET = import.meta.env.COOKIE_SECRET || "your_cookie_secret";

const decrypt = (text: string): string => {
  try {
    const bytes = crypto.AES.decrypt(text, COOKIE_SECRET);
    return bytes.toString(crypto.enc.Utf8);
  } catch {
    return "";
  }
};

interface AuthSate {
  token: string | null;
  roles: string[];
  isAuthenticated: boolean;
  username: string | null;
  userId: number | null;
}

const token = Cookies.get("token") ? decrypt(Cookies.get("token")!) : null;
const roles = Cookies.get("roles")
  ? JSON.parse(decrypt(Cookies.get("roles")!))
  : [];
const username = Cookies.get("username")
  ? decrypt(Cookies.get("username")!)
  : null;
const storedUserId = Cookies.get("userId")
  ? decrypt(Cookies.get("userId")!)
  : null;

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
      const response = await axios.get("/api/verifyToken", {
        withCredentials: true,
      });
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
      Cookies.set(
        "token",
        crypto.AES.encrypt(action.payload.token, COOKIE_SECRET).toString(),
        {
          secure: true,
          sameSite: "Strict",
        }
      );
      Cookies.set(
        "roles",
        crypto.AES.encrypt(
          JSON.stringify(action.payload.roles),
          COOKIE_SECRET
        ).toString(),
        {
          secure: true,
          sameSite: "Strict",
        }
      );
      Cookies.set(
        "username",
        crypto.AES.encrypt(action.payload.username, COOKIE_SECRET).toString(),
        {
          secure: true,
          sameSite: "Strict",
        }
      );
      Cookies.set(
        "userId",
        crypto.AES.encrypt(
          action.payload.userId.toString(),
          COOKIE_SECRET
        ).toString(),
        {
          secure: true,
          sameSite: "Strict",
        }
      );
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
