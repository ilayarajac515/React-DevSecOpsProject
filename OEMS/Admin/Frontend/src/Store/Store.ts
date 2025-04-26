import { configureStore } from '@reduxjs/toolkit';
import { formSlice } from '../api_Slices/form_slice';

export const store = configureStore({
  reducer: {
    [formSlice.reducerPath]: formSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(formSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
