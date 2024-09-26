import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RouteState {
  originId: string | null;
  destinationId: string | null;
  price: number | null;
}

const initialState: RouteState = {
  originId: null,
  destinationId: null,
  price: null,
};

const routesSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    setOrigin: (state, action: PayloadAction<string>) => {
      state.originId = action.payload;
    },
    setDestination: (state, action: PayloadAction<string>) => {
      state.destinationId = action.payload;
    },
    setPrice: (state, action: PayloadAction<number>) => {
      state.price = action.payload;
    },
  },
});

export const { setOrigin, setDestination, setPrice } = routesSlice.actions;
export default routesSlice.reducer;
