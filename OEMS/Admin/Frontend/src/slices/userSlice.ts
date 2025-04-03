import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  name: string | null;
}

const initialState: UserState = {
  name: localStorage.getItem("UserName") || null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
      localStorage.setItem("UserName", action.payload);
    },
    clearUser: (state) => {
      state.name = null;
      localStorage.removeItem("UserName");
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
