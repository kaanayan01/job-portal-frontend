import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  jobSeeker: null,
  token: null,
};

const jobSeekerSlice = createSlice({
  name: 'jobSeeker',
  initialState,
  reducers: {
    setJobSeeker(state, action) {
      state.jobSeeker = action.payload.jobSeeker || action.payload;
    },
    clearJobSeeker(state) {
      state.jobSeeker = null;
      state.token = null;
    },
  },
});

export const { setJobSeeker, clearJobSeeker } = jobSeekerSlice.actions;
export default jobSeekerSlice.reducer;
