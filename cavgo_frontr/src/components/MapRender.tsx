/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from 'react';
import { Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useDeleteLocation } from '@/hooks/useDeleteLocation'; // Import the hook
import { toast } from 'react-toastify';

interface Coordinates {
  lat: number;
  lng: number;
}

interface Location {
  id: string;
  name: string;
  type: string;
  coordinates: Coordinates;
  address: string;
  googlePlaceId: string;
  createdAt: string;
}

interface MapRenderProps {
  locations: Location[]; // Array of locations
}

const MapRender: React.FC<MapRenderProps> = ({ locations }) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null); // Track the selected marker ID
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(null); // Track selected marker coordinates
  const { deleteLocation } = useDeleteLocation(); // Use the custom delete hook
  const map = useMap(); // Get the map instance

  // Store the default center and zoom level
  const defaultCenter: Coordinates = locations.length > 0 ? locations[0].coordinates : { lat: -1.9441, lng: 30.0619 };
  const defaultZoom = 9;

  // Handle marker click to show delete button and focus on the marker
  const handleMarkerClick = (location: Location) => {
    setSelectedLocationId(location.id);
    setSelectedLocation(location.coordinates);
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    if (selectedLocationId) {
      deleteLocation(selectedLocationId);
      setSelectedLocationId(null); // Close the delete button after deleting
    } else {
      toast.error('No location selected for deletion');
    }
  };

  // Handle back button click to revert to default view
  const handleBackClick = () => {
    if (map) {
      map.setCenter(defaultCenter);
      map.setZoom(defaultZoom);
    }
    setSelectedLocationId(null); // Close the delete button
  };

  // Focus on the selected marker when it changes
  useEffect(() => {
    if (map && selectedLocation) {
      // Use panTo to center the map on the selected marker
      map.panTo({ lat: selectedLocation.lat, lng: selectedLocation.lng });
      map.setZoom(12); // Optionally zoom in closer to the marker
    }
  }, [map, selectedLocation]);

  if (locations.length === 0) {
    return <p>No locations available</p>; // Handle case when no locations are provided
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '70vh' }}>
      <Map
        mapId={process.env.NEXT_PUBLIC_MAP_ID_RWANDA as string} // Ensure this is a valid Map ID or API Key
        style={{ width: '100%', height: '100%' }}
        defaultCenter={defaultCenter}
        defaultZoom={defaultZoom}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        reuseMaps={true}
      >
        {locations.map((location) => (
          <AdvancedMarker
            key={location.id} // Use location ID as the key
            position={{
              lat: location.coordinates.lat,
              lng: location.coordinates.lng,
            }} // Position of the marker
            title={location.name} // Marker title (tooltip)
            onClick={() => handleMarkerClick(location)} // Handle marker click
          />
        ))}
      </Map>

      {/* Display delete and back buttons only when a marker is selected */}
      {(selectedLocationId || selectedLocation) && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 10,
            background: 'white',
            padding: '10px',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)',
          }}
        >
          {selectedLocationId && (
            <>
              <p>Do you want to delete this location?</p>
              <button
                onClick={handleDeleteClick}
                className="p-2 bg-red-500 text-white rounded"
              >
                Delete Location
              </button>
              <button
            onClick={handleBackClick}
            className="p-2 bg-gray-500 text-white rounded"
          >
            Back to Default View
          </button>
              <br />
            </>
          )}

        </div>
      )}
    </div>
  );
};

export default MapRender;
