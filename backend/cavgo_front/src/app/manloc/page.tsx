/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_LOCATIONS } from '@/lib/queries/queries';
import MapRender from "@/components/MapRender";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useDeleteLocation } from '@/hooks/useDeleteLocation'; // Import the custom hook

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

interface Coordinates {
  lat: number;
  lng: number;
}

interface Locate {
  id: string;
  name: string;
  type: string;
  coordinates: Coordinates;
  address: string;
  googlePlaceId: string;
  createdAt: string;
}

const LocationManagementPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'map'>('list'); // Toggle view
  const [selectedType, setSelectedType] = useState<string>('');

  // Fetch locations based on type
  const { data, loading, error } = useQuery(GET_LOCATIONS, {
    variables: { type: selectedType },
  });

  const { deleteLocation } = useDeleteLocation(); // Use the delete hook

  if (loading) return <p>Loading...</p>;
  if (error) {
    toast.error("Error fetching locations");
    return <p>Error fetching locations</p>;
  }

  const locations: Locate[] = data?.getLocations.data || [];
  console.log(locations);

  const handleToggleView = () => {
    setView((prevView) => (prevView === 'list' ? 'map' : 'list'));
  };

  return (
    <APIProvider region="RW" apiKey={API_KEY}>
      <div style={{ height: "100vh", width: "100%" }}>
        <ToastContainer />

        <div className="p-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Select Location Type</option>
            <option value="bus_stop">Bus Stop</option>
            <option value="route_stop">Route Stop</option>
            <option value="restaurant">Restaurant</option>
            <option value="other">Other</option>
          </select>
          
          <button
            onClick={handleToggleView}
            className="mt-2 p-2 bg-blue-500 text-white rounded"
          >
            Toggle to {view === 'list' ? 'Map' : 'List'} View
          </button>
        </div>

        {view === 'list' && (
          <div className="p-4">
            <ul>
              {locations.map(location => (
                <li key={location.id} className="border-b py-2 flex justify-between items-center">
                  <span>{location.name}</span>
                  <button
                    onClick={() => deleteLocation(location.id)} // Use the delete function from the hook
                    className="ml-2 p-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {view === 'map' && (
          <div style={{ height: "80vh", width: "100%" }}>
            <MapRender locations={locations} />
          </div>
        )}
      </div>
    </APIProvider>
  );
};

export default LocationManagementPage;
