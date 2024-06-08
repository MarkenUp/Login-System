import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/loginAuth/authSlice";
import userReducer from "../features/loginAuth/userSlice";
import memoReducer from "../features/loginAuth/memoSlice";
import clientReducer from "../features/loginAuth/clientSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    memos: memoReducer,
    clients: clientReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
