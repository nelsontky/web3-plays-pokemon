import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import gameDataReducer from "./slices/gameDataSlice";
import gameStatesReducer from "./slices/gameStatesSlice";

export const store = configureStore({
  reducer: {
    gameData: gameDataReducer,
    gameStates: gameStatesReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
