import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import gameDataReducer, { GameDataState } from "./slices/gameDataSlice";
import gameStatesReducer, { GameState } from "./slices/gameStatesSlice";
import historyReducer from "./slices/historySlice";

export const store = configureStore({
  reducer: {
    gameData: gameDataReducer,
    gameStates: gameStatesReducer,
    history: historyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
