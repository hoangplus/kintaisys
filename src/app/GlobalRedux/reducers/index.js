import { combineReducers } from '@reduxjs/toolkit';

import counterReducer from './counter.';
import userReducer from './user.reducer';
import listUserReducer from './listuser.reducer';
import listRequestReducer from './listRequest.reducer';

export default combineReducers({
  // counter: counterReducer,
  user: userReducer,
  listUser: listUserReducer,
  listRequest: listRequestReducer
});
