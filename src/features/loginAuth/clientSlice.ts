import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface Client {
  Id: number;
  CompanyName: string;
  CompanyAddress: string;
  ContactPerson: string;
  ContactNumber: string;
  Email: string;
}

interface ClientState {
  clients: Client[];
  loading: boolean;
  error: string | null;
}

const initialState: ClientState = {
  clients: [],
  loading: false,
  error: null,
};

interface FetchClientResponse {
  clients: Client[];
}

interface ThunkError {
  message: string;
}

export const fetchClients = createAsyncThunk<
  Client[],
  void,
  { rejectValue: ThunkError }
>("clients/fetchClients", async (_, thunkAPI) => {
  try {
    const response = await axios.get<FetchClientResponse>(
      "http://localhost:8800/api/admin/clients"
    );
    return response.data.clients;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: "Failed to fetch clients" });
  }
});

export const updateClient = createAsyncThunk<
  {
    id: number;
    companyName: string;
    companyAddress: string;
    contactPerson: string;
    contactNumber: string;
    email: string;
  },
  {
    id: number;
    companyName: string;
    companyAddress: string;
    contactPerson: string;
    contactNumber: string;
    email: string;
  },
  { rejectValue: ThunkError }
>(
  "clients/updateClient",
  async (
    { id, companyName, companyAddress, contactPerson, contactNumber, email },
    thunkApi
  ) => {
    try {
      await axios.put(`http://localhost:8800/api/admin/clients/${id}`, {
        CompanyName: companyName,
        CompanyAddress: companyAddress,
        ContactPerson: contactPerson,
        ContactNumber: contactNumber,
        Email: email,
      });
      return {
        id,
        companyName,
        companyAddress,
        contactPerson,
        contactNumber,
        email,
      };
    } catch (error) {
      return thunkApi.rejectWithValue({ message: "Failed to update client" });
    }
  }
);

export const deleteClient = createAsyncThunk<
  number,
  number,
  { rejectValue: ThunkError }
>("clients/deleteClient", async (id, thunkAPI) => {
  try {
    await axios.delete(`http://localhost:8800/api/admin/clients/${id}`);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: "Failed to delete client" });
  }
});

const clientSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.clients = action.payload;
        state.loading = false;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch clients";
      })
      .addCase(updateClient.pending, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        const {
          id,
          companyName,
          companyAddress,
          contactPerson,
          contactNumber,
          email,
        } = action.payload;
        const clientIndex = state.clients.findIndex(
          (client) => client.Id === id
        );
        if (clientIndex !== -1) {
          state.clients[clientIndex] = {
            Id: id,
            CompanyName: companyName,
            CompanyAddress: companyAddress,
            ContactPerson: contactPerson,
            ContactNumber: contactNumber,
            Email: email,
          };
        }
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to update client";
      })
      .addCase(deleteClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.clients = state.clients.filter(
          (client) => client.Id !== action.payload
        );
        state.loading = false;
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete client";
      });
  },
});

export default clientSlice.reducer;
