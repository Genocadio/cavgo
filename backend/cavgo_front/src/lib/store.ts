import { configureStore } from "@reduxjs/toolkit";
import testReducer from "./features/testSlice";
import routesReducer from "./features/routesSlice";
import routeReducer from "./features/routeSlice";
import tripReducer from "./features/tripSlice";
import locatioReducer from "./features/locationsSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
        test: testReducer,
        routes: routesReducer,
        route: routeReducer,
        trip: tripReducer,
        locations: locatioReducer,  // Add other reducers here as needed. For example: locations: locationsReducer, cars: carsReducer, etc.   // Note: Don't forget to add them in the makeStore function.  // Example: locations: locationsReducer, cars: carsReducer, etc.  // Note: Don't forget to add them in the makeStore function.  // Example: locations: locationsReducer, cars: carsReducer, etc.  // Note: Don
  
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;

export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];