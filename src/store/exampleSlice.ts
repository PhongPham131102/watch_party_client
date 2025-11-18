import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExampleState {
  value: number;
}

const initialState: ExampleState = {
  value: 0,
};

const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    setValue(state, action: PayloadAction<number>) {
      state.value = action.payload;
    },
    increment(state) {
      state.value += 1;
    },
    decrement(state) {
      state.value -= 1;
    },
  },
});

export const { setValue, increment, decrement } = exampleSlice.actions;
export default exampleSlice.reducer;
