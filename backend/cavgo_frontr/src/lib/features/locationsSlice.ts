// src/lib/features/locationsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Location {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface LocationsState {
  origin: Location | null;
  destination: Location | null;
}

const initialState: LocationsState = {
  origin: null,
  destination: null,
};

export const locationsSlice = createSlice({
  name: 'locations',
  initialState,
  reducers: {
    setOrigin: (state, action: PayloadAction<Location>) => {
      state.origin = action.payload;
    },
    setDestination: (state, action: PayloadAction<Location>) => {
      state.destination = action.payload;
    },
    clearLocations: (state) => {
      state.origin = null;
      state.destination = null;
    }
  },
});

export const { setOrigin, setDestination, clearLocations } = locationsSlice.actions;
export default locationsSlice.reducer;
