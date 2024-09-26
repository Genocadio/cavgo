import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StopPointPriceInput {
  locationId: string;
  price: number;
}

interface TripState {
  routeId: string | null;
  carId: string | null;
  boardingTime: string;
  status: string;
  stopPoints: StopPointPriceInput[];
  reverseRoute: boolean;
  availableSeats: number;
}

const initialState: TripState = {
  routeId: null,
  carId: null,
  boardingTime: '',
  status: '',
  stopPoints: [],
  reverseRoute: false,
  availableSeats: 0,
};

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    setRouteId(state, action: PayloadAction<string | null>) {
      state.routeId = action.payload;
    },
    setCarId(state, action: PayloadAction<string | null>) {
      state.carId = action.payload;
    },
    setBoardingTime(state, action: PayloadAction<string>) {
      state.boardingTime = action.payload;
    },
    setStatus(state, action: PayloadAction<string>) {
      state.status = action.payload;
    },
    addStopPoint(state, action: PayloadAction<StopPointPriceInput>) {
      state.stopPoints.push(action.payload);
    },
    removeStopPoint(state, action: PayloadAction<number>) {
      state.stopPoints = state.stopPoints.filter((_, index) => index !== action.payload);
    },
    updateStopPoint(state, action: PayloadAction<{ index: number; updatedData: Partial<StopPointPriceInput> }>) {
      const { index, updatedData } = action.payload;
      if (index >= 0 && index < state.stopPoints.length) {
        state.stopPoints[index] = {
          ...state.stopPoints[index],
          ...updatedData,
        };
      }
    },
    reorderStopPoints(state, action: PayloadAction<{ fromIndex: number; toIndex: number }>) {
      const { fromIndex, toIndex } = action.payload;
      if (fromIndex >= 0 && fromIndex < state.stopPoints.length && toIndex >= 0 && toIndex < state.stopPoints.length) {
        const [movedItem] = state.stopPoints.splice(fromIndex, 1);
        state.stopPoints.splice(toIndex, 0, movedItem);
      }
    },
    toggleReverseRoute(state) {
      state.reverseRoute = !state.reverseRoute;
    },
    setAvailableSeats(state, action: PayloadAction<number>) {
      state.availableSeats = action.payload;
    },
  },
});

export const {
  setRouteId,
  setCarId,
  setBoardingTime,
  setStatus,
  addStopPoint,
  removeStopPoint,
  updateStopPoint,
  reorderStopPoints,
  toggleReverseRoute,
  setAvailableSeats,
} = tripSlice.actions;

export default tripSlice.reducer;
