// src/lib/features/testSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TestState {
  value: number;
}

const initialState: TestState = {
  value: 0,
};

const testSlice = createSlice({
  name: "test",
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    setValue: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
    },
  },
});

export const { increment, decrement, setValue } = testSlice.actions;
export default testSlice.reducer;
