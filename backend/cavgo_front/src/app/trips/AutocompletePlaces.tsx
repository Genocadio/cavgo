/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface Place {
    lat: number;
    lng: number;
    description: string;
    googlePlaceId: string;
}

interface AutocompletePlacesProps {
    onPlaceSelected: (place: Place) => void;
}

// Define a mock route with predefined coordinates
const MOCK_ROUTE_COORDS: google.maps.LatLngLiteral[] = [
  { lat: -1.9578, lng: 30.1127 }, // Kigali (approximate center)
  { lat: -1.9751, lng: 30.1550 }, // Intermediate point
  { lat: -2.0868, lng: 30.2610 }, // Near Rubavu
  { lat: -2.1615, lng: 30.3416 }  // Rubavu (approximate center)
];

export const AutocompletePlaces: React.FC<AutocompletePlacesProps> = ({ onPlaceSelected }) => {
    const placesLibrary = useMapsLibrary("places");
    const [service, setService] = useState<any>(null);
    const [results, setResults] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        if (placesLibrary) {
            setService(new placesLibrary.AutocompleteService());
        }
        return () => setService(null);
    }, [placesLibrary]);

    const updateResults = (inputValue: string) => {
        if (!service || inputValue.length === 0) {
            setResults([]);
            return;
        }
        const request = { input: inputValue };
        service.getQueryPredictions(request, (res: any) => {
            setResults(res || []);
        });
    };

    const onInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        const value = ev.target.value;
        setInputValue(value);
        updateResults(value);
    };

    const handleSelectedPlace = (place: any) => {
        setInputValue(place.description);
        setResults([]);

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ placeId: place.place_id }, (results, status) => {
            if (status === "OK" && results && results[0]) {
                const location = results[0].geometry.location;
                const placeDetails = {
                    lat: location.lat(),
                    lng: location.lng(),
                    description: place.description,
                    googlePlaceId: place.place_id
                };
                
                // Check if the selected location is on the mock route
                const routePoly = new google.maps.Polyline({
                    path: MOCK_ROUTE_COORDS,
                });

                const isOnEdge = google.maps.geometry.poly.isLocationOnEdge(location, routePoly, 10e-5);
                if (isOnEdge) {
                    console.log("The selected location is on the route.");
                } else {
                    console.log("The selected location is out of the route.");
                }
                
                onPlaceSelected(placeDetails);
            } else {
                console.error("Geocode was not successful for the following reason:", status);
            }
        });
    };

    return (
        <div className="max-w-96">
            <input
                className="p-2 rounded-xl border border-gray-300 w-full focus:outline-none focus:border-gray-500 transition-all duration-200 ease-in-out"
                value={inputValue}
                onChange={onInputChange}
                placeholder="Search for a place"
            />
            {results.length > 0 && (
                <ul className="bg-white mt-2 border border-gray-300 rounded-xl shadow-lg">
                    {results.map((place, index) => (
                        <li
                            className="cursor-pointer whitespace-nowrap p-2 hover:bg-slate-100 overflow-hidden"
                            key={place.place_id || index} // Fallback to index if place_id is unavailable
                            onClick={() => handleSelectedPlace(place)}
                        >
                            {place.description}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};