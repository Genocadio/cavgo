// tripResponseTypes.ts

export interface Coordinates {
    lat: number;
    lng: number;
  }
  
  export interface Location {
    address: string;
    coordinates: Coordinates;
    createdAt: string;
    googlePlaceId: string;
    id: string;
    name: string;
  }
  
  export interface Origin extends Location {
    type: string; // This property is now required
  }
  
  export interface Destination extends Location {
    type: string; // This property is now required
  }
  
  export interface Route {
    stopPoints: boolean;
    id: string;
    googleMapsRouteId: string;
    price: number;
    origin: Origin;
    destination: Destination;
  }
  
  export interface OwnerCompany {
    name?: string; // Optional field
  }
  
  export interface Driver {
    name?: string; // Optional field
  }
  
  export interface Car {
    plateNumber: string;
    ownerCompany?: OwnerCompany; // Optional field
    driver?: Driver;             // Optional field
  }
  
  export interface StopPoint {
    price: number;
    location: Location; // Ensure location is defined
  }
  
  export interface TripData {
    id: string;
    route: Route;
    car: Car;
    availableSeats: number;
    status: string; // Status can be "Scheduled", "Completed", etc.
    stopPoints: StopPoint[]; // Ensure that stop points can be an empty array
    boardingTime: string; 
    reverseRoute: boolean; // This can also be true/false based on logic
    createdAt?: string; // Optionally include createdAt if needed
    user?: {
      id: string; // User ID associated with the trip
      name: string; // User name associated with the trip
    }; // Optional user information
  }
  
  // Response interfaces for GraphQL mutation
  export interface AddTripResponse {
    addTrip: {
      success: boolean;
      message?: string;
      data?: TripData; // Data should match TripData structure
    };
  }
  