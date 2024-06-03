import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface User {
  Id: number;
  Username: string;
  Role: string;
}

interface UserState {
  users: User[];
  roles: string[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  roles: [],
  loading: false,
  error: null,
};

// Define the response data type for fetchUsers
interface FetchUsersResponse {
  users: User[];
}

// Define the thunk's rejection type
interface ThunkError {
  message: string;
}

// Async thunk to fetch users
export const fetchUsers = createAsyncThunk<
  User[],
  void,
  { rejectValue: ThunkError }
>("users/fetchUsers", async (_, thunkAPI) => {
  try {
    const response = await axios.get<FetchUsersResponse>(
      "http://localhost:8800/api/admin/users"
    );
    return response.data.users;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: "Failed to fetch users" });
  }
});

// Async thunk to update a user
export const updateUser = createAsyncThunk<
  { id: number; username: string; role: string },
  { id: number; username: string; role: string },
  { rejectValue: ThunkError }
>("users/updateUser", async ({ id, username, role }, thunkApi) => {
  try {
    await axios.put(`http://localhost:8800/api/admin/users/${id}`, {
      Username: username,
      Role: role,
    });
    return { id, username, role };
  } catch (error) {
    return thunkApi.rejectWithValue({ message: "Failed to update user" });
  }
});

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.roles = Array.from(
          new Set(action.payload.map((user) => user.Role))
        );
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch users";
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const { id, username, role } = action.payload;
        const userIndex = state.users.findIndex((user) => user.Id === id);
        if (userIndex !== -1) {
          state.users[userIndex] = { Id: id, Username: username, Role: role };
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to update user";
      });
  },
});

export default userSlice.reducer;
