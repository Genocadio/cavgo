// types.ts or another appropriate file

export interface Coordinates {
    lng: number;
    lat: number;
}

export interface Location {
    id: string;
    name: string;
    coordinates: Coordinates;
    address: string;
    googlePlaceId: string;
    createdAt: string;
}

export interface GetLocationsResponse {
    message: string;
    data: Location[];
    success: boolean;
}

export interface GetLocationsData {
    getLocations: GetLocationsResponse;
}
