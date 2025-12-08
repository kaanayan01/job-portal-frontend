import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user || action.payload;
    },
    setToken(state, action) {
      state.token = action.payload;
    },
    clearUser(state) {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setUser, setToken, clearUser } = userSlice.actions;
export default userSlice.reducer;
