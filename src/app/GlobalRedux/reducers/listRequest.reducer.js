import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listRequest: null,
};

const listRequestSlice = createSlice({
  name: "list_request_slice",
  initialState,
  reducers: {
    setListRequest(state, action) {
      state.listRequest = action.payload;
    },
  },
});

export const { setListRequest } = listRequestSlice.actions;
export default listRequestSlice.reducer;
