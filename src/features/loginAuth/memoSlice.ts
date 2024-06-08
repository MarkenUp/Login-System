import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export interface Memos {
  Id: number;
  UserId: number;
  Date: string;
  Memo: string;
}

interface Memo {
  Id: number;
  UserId: number;
  Date: string;
  Memo: string;
}

interface MemoState {
  memos: Memo[];
  loading: boolean;
  error: string | null;
}

const initialState: MemoState = {
  memos: [],
  loading: false,
  error: null,
};

interface fetchMemoResponse {
  memos: Memo[];
}

interface ThunkError {
  message: string;
}

// Async thunk for fetching memos
export const fetchMemos = createAsyncThunk<
  Memo[],
  number,
  { rejectValue: ThunkError }
>("memo/fetchMemos", async (userId, thunkAPI) => {
  try {
    const response = await axios.get<fetchMemoResponse>(
      `http://localhost:8800/api/general/memos/${userId}`
    );
    return response.data.memos;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: "Failed to fetch users" });
  }
});

// Async thunk for creating a memo
export const createMemo = createAsyncThunk<
  Memo,
  { userId: number; date: string; memo: string },
  { rejectValue: ThunkError }
>("meme/createMemo", async ({ userId, date, memo }, thunkAPI) => {
  try {
    const response = await axios.post<Memo>(
      "http://localhost:8800/api/general/memos",
      { UserId: userId, Date: date, Memo: memo }
    );
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: "Failed to create memo" });
  }
});

// Async thunk for updating a memo
export const updateMemo = createAsyncThunk<
  Memo,
  { id: number; memo: string; date: string },
  { rejectValue: ThunkError }
>("memo/updateMemo", async ({ id, memo, date }, thunkAPI) => {
  try {
    const response = await axios.put<Memo>(
      `http://localhost:8800/api/general/memos/${id}`,
      { Memo: memo, Date: date }
    );
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: "Failed to update memo" });
  }
});

// Async thunk for deleting a memo
export const deleteMemo = createAsyncThunk<
  number,
  number,
  { rejectValue: ThunkError }
>("memo/deleteMemo", async (id, thunkAPI) => {
  try {
    await axios.delete(`http://localhost:8800/api/general/memos/${id}`);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: "Failed to delete memo" });
  }
});

const memoSlice = createSlice({
  name: "memo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMemos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemos.fulfilled, (state, action: PayloadAction<Memo[]>) => {
        state.loading = false;
        state.memos = action.payload;
      })
      .addCase(fetchMemos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch memos";
      })
      .addCase(createMemo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMemo.fulfilled, (state, action: PayloadAction<Memo>) => {
        state.loading = false;
        state.memos.push(action.payload);
      })
      .addCase(createMemo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create memo";
      })
      .addCase(updateMemo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMemo.fulfilled, (state, action: PayloadAction<Memo>) => {
        state.loading = false;
        const index = state.memos.findIndex(
          (memo) => memo.Id === action.payload.Id
        );
        if (index !== -1) {
          state.memos[index] = action.payload;
        }
      })
      .addCase(updateMemo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update memo";
      })
      .addCase(deleteMemo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMemo.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.memos = state.memos.filter((memo) => memo.Id !== action.payload);
      })
      .addCase(deleteMemo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete memo";
      });
  },
});

export default memoSlice.reducer;
