import { configureStore } from '@reduxjs/toolkit';
import { formSlice } from '../modules/admin_slice';
import { candidateSlice } from '../modules/candidate_slice';

export const store = configureStore({
  reducer: {
    [formSlice.reducerPath]: formSlice.reducer,
    [candidateSlice.reducerPath]: candidateSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(formSlice.middleware)
      .concat(candidateSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
