import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  employer: null,
  token: null,
};

const employerSlice = createSlice({
  name: 'employer',
  initialState,
  reducers: {
    setEmployer(state, action) {
      state.employer = action.payload.employer || action.payload;
    },
    clearEmployer(state) {
      state.employer = null;
    },
  },
});

export const { setEmployer, clearEmployer } = employerSlice.actions;
export default employerSlice.reducer;
