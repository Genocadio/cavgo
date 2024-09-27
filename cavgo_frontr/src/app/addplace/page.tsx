/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { AutocompletePlaces } from './Autocomplete';
import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { ADD_LOCATION } from '@/lib/queries/mutations';
import MapRender from "@/components/MapRender";
import { toast } from "react-toastify";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

export default function MapPage() {
  const [addLocation] = useMutation(ADD_LOCATION);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [placeType, setPlaceType] = useState<string>(''); // State for place type
  const [error, setError] = useState<string | null>(null);

  const handleAddPlace = (place: any) => {
    setSelectedPlace(place);
  };

  const handleSubmit = async () => {
    if (!selectedPlace || !placeType) {
      setError("Please select a place and a place type.");
      return;
    }

    try {
      const { data } = await addLocation({
        variables: {
          name: selectedPlace.description,
          type: placeType,
          coordinates: {
            lat: selectedPlace.lat,
            lng: selectedPlace.lng
          },
          address: selectedPlace.description,
          googlePlaceId: selectedPlace.googlePlaceId
        }
      });

      if (data?.addLocation?.success) {
        toast.success("Location added successfully");
        setSelectedPlace(null); // Clear selected place
        setPlaceType(''); // Reset place type
      } else {
        toast.error(data?.addLocation?.message || 'Location not added');
      }
    } catch (err) {
      toast.error("An error occurred while adding the location.");
    }
  };

  const handlePlaceTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPlaceType(event.target.value); // Set the selected place type
  };

  return (
    <APIProvider apiKey={API_KEY}>
      <div style={{ height: "100vh", width: "100%" }}>
        <AutocompletePlaces onPlaceSelected={handleAddPlace} />
        {selectedPlace && (
          <>
            <div>
              <p>Selected Place: {selectedPlace.description}</p>
              <select
                value={placeType}
                onChange={handlePlaceTypeChange}
                className="mt-2 p-2 border rounded"
              >
                <option value="" disabled>Select Place Type</option>
                <option value="bus_stop">Bus Stop</option>
                <option value="route_stop">Route Stop</option>
                <option value="restaurant">Restaurant</option>
                <option value="other">Other</option>
              </select>
              <button
                onClick={handleSubmit}
                className="mt-2 p-2 bg-blue-500 text-white rounded"
                disabled={!placeType} // Disable if no place type is selected
              >
                Add Place
              </button>
            </div>
            <div style={{ height: "60vh", width: "100%" }}>
              <MapRender
                locations={[{
                  id: "temp-id", // Placeholder ID, replace with a real ID if available
                  name: selectedPlace.description,
                  type: placeType,
                  coordinates: {
                    lat: selectedPlace.lat,
                    lng: selectedPlace.lng
                  },
                  address: selectedPlace.description,
                  googlePlaceId: selectedPlace.googlePlaceId,
                  createdAt: new Date().toISOString() // Use current date as a placeholder
                }]}
              />
            </div>
          </>
        )}
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </APIProvider>
  );
}
