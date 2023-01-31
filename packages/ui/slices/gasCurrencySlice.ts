import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = null as string | null;

const gasCurrencySlice = createSlice({
  name: "gasCurrency",
  initialState,
  reducers: {
    setGasCurrency: (_state, action: PayloadAction<string | null>) => {
      return action.payload;
    },
  },
});

export const { setGasCurrency } = gasCurrencySlice.actions;

export default gasCurrencySlice.reducer;
