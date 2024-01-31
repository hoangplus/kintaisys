import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listUserInfo: [],
};

const listUserSlice = createSlice({
  name: "list_user_slice",
  initialState,
  reducers: {
    setListUserInfo(state, action) {
      state.listUserInfo = action.payload;
    },
  },
});

export const { setListUserInfo } = listUserSlice.actions;
export default listUserSlice.reducer;
