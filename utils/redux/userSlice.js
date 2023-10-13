import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    value: null,
    loaded: false,
    id: null,
  },
  reducers: {
    setUser: (state, action) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes.
      // Also, no return statement is required from these functions.
      state.value = action.payload;
    },
    setLoaded: (state) => {
      state.loaded = true;
    },
    setId: (state, action) => {
      state.id = action.payload;
    },
    clearUser: (state) => {
      state.value = null;
      state.id = null;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setUser, setLoaded, setId, clearUser } = userSlice.actions;

export default userSlice.reducer;
