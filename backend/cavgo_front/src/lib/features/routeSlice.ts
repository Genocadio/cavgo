import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Coordinates {
  lat: number;
  lng: number;
}

interface Location {
  coordinates: Coordinates;
  name: string;
}

interface Route {
  id: string;
  origin: Location;
  destination: Location;
  price: number;
}

interface RouteState {
  selectedRoute: Route | null;
}

const initialState: RouteState = {
  selectedRoute: null,
};

const routeSlice = createSlice({
  name: 'route',
  initialState,
  reducers: {
    setSelectedRoute(state, action: PayloadAction<Route>) {
      state.selectedRoute = action.payload;
    },
  },
});

export const { setSelectedRoute } = routeSlice.actions;
export default routeSlice.reducer;
