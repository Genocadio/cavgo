"use client";
import { useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMapsLibrary,
  useMap,
} from "@vis.gl/react-google-maps";
import { useAppDispatch } from "@/lib/hooks"; // Typed dispatch hook
import { useLocations } from "@/hooks/useLocations"; // External hook for fetching locations
import { useAddLocation } from "@/hooks/useAddLocation"; // Import the new hook
import { ApolloError } from '@apollo/client';
import { addStopPoint } from '@/lib/features/tripSlice'; // Redux action for adding stop points
import { useAppSelector } from "@/lib/hooks";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
const center = { lat: -1.9441, lng: 30.0619 }; // Kigali, Rwanda

export default function MapRoutes() {
  const dispatch = useAppDispatch(); // Using typed dispatch
  const [stops, setStops] = useState<{
    name: string;
    coordinates: google.maps.LatLng;
    address: string;
    googlePlaceId: string;
    id?: string;
    isNew: boolean; // Flag to differentiate new stops
  }[]>([]);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [newStop, setNewStop] = useState(""); // Input for new stop
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null); // Index of the selected stop for actions
  const { locations, loading, error, filterLocations } = useLocations();
  const errorMessage = error instanceof ApolloError ? error.message : 'An unexpected error occurred';
  const { handleAddLocation } = useAddLocation(); // Use the hook

  const handleAddStop = async () => {
    if (newStop) {
      try {
        const geocoder = new google.maps.Geocoder();
        const geocodeResult = await geocodeAddress(newStop, geocoder);
        const { address, googlePlaceId } = await reverseGeocode(geocodeResult, geocoder);

        const newStopData = {
          name: newStop,
          coordinates: geocodeResult,
          address,
          googlePlaceId,
          isNew: true // Flag new stops
        };

        setStops([...stops, newStopData]);
        setNewStop(""); // Reset input
        setSelectedStopIndex(stops.length); // Show actions for the newly added stop
      } catch (error) {
        console.error("Failed to geocode the address", error);
      }
    }
  };

  const handleAddStopFromLocation = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      const { lat, lng } = location.coordinates;
      const geocodeResult = new google.maps.LatLng(lat, lng);

      const newStopData = {
        name: location.name,
        coordinates: geocodeResult,
        address: location.name, // Assuming the name is the address
        googlePlaceId: "", // Empty for now, can be set if available
        id: locationId,
        isNew: false // Indicate that this stop was fetched from the database
      };

      // Add the stop to the local state
      setStops([...stops, newStopData]);
      setSelectedStopIndex(stops.length); // Show actions for the newly added location

      // Dispatch the stop point ID to Redux store
      dispatch(addStopPoint({ locationId: newStopData.id!, price: 0 })); // Dispatch with price 0, adjust as needed
    }
  };

  const handleShowActions = (index: number) => {
    setSelectedStopIndex(index);
  };

  const handleDeleteStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
    setSelectedStopIndex(null);
  };

  const handleSaveStop = async (index: number) => {
    const stop = stops[index];
    try {
      // Call API to save the stop to the backend
      const response = await handleAddLocation({
        name: stop.name,
        type: "bus_stop", // Default type for stops; adjust as needed
        coordinates: {
          lat: stop.coordinates.lat(),
          lng: stop.coordinates.lng(),
        },
        address: stop.address,
        googlePlaceId: stop.googlePlaceId,
      });
      console.log('Response:', response, response.data);
  
      if (response?.success) {
        const locationData = response.data;
  
        console.log("Location added successfully:", locationData);
  
        // If the stop is newly added and we get a valid response with an ID, update the stop's data
        if (stop.isNew && locationData && locationData.id) {
          const updatedStops = [...stops];
          updatedStops[index] = {
            ...updatedStops[index],
            id: locationData.id,
            isNew: false, // Mark it as saved
          };
          setStops(updatedStops);
  
          // Dispatch the stop point ID to Redux store
          dispatch(addStopPoint({ locationId: locationData.id, price: 0 })); // Adjust price as needed
        }
      } else {
        console.error("Failed to add location:", response?.data?.addLocation?.message);
      }
    } catch (error) {
      console.error("Failed to save stop data:", error);
    }
    setSelectedStopIndex(null);
  };
  

  const geocodeAddress = (address: string, geocoder: google.maps.Geocoder) =>
    new Promise<google.maps.LatLng>((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (results && status === google.maps.GeocoderStatus.OK) {
          resolve(results[0].geometry.location);
        } else {
          reject(`Geocode failed: ${status}`);
        }
      });
    });

  const reverseGeocode = (latLng: google.maps.LatLng, geocoder: google.maps.Geocoder) =>
    new Promise<{ address: string, googlePlaceId: string }>((resolve, reject) => {
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (results && status === google.maps.GeocoderStatus.OK && results[0]) {
          const result = results[0];
          resolve({
            address: result.formatted_address,
            googlePlaceId: result.place_id || "" // Get the Google Place ID if available
          });
        } else {
          reject(`Reverse geocode failed: ${status}`);
        }
      });
    });

  const handleMarkerDragEnd = async (index: number, newPosition: google.maps.LatLng) => {
    const geocoder = new google.maps.Geocoder();
    try {
      const { address, googlePlaceId } = await reverseGeocode(newPosition, geocoder);
      const updatedCoordinates = [...stops];
      updatedCoordinates[index] = {
        ...updatedCoordinates[index],
        coordinates: newPosition,
        name: address, // Update name to the new address
        address,
        googlePlaceId,
      };
      setStops(updatedCoordinates); // Update the state with new marker position and details
      handleShowActions(index); // Show actions for the updated stop
    } catch (error) {
      console.error("Failed to reverse geocode the address", error);
    }
  };

  return (
<APIProvider region="RW" apiKey={API_KEY}>
  <button onClick={() => setIsMapVisible(!isMapVisible)}>
    {isMapVisible ? 'Hide Map' : 'Show Map'}
  </button>

  <div>
    <div>
      <input
        type="text"
        value={newStop}
        onChange={(e) => setNewStop(e.target.value)}
        placeholder="Add Stop Point"
      />
      <button onClick={handleAddStop}>Add Stop</button>
    </div>

    <div>
      <input
        type="text"
        onChange={(e) => filterLocations(e.target.value)}
        placeholder="Filter Locations"
      />
      {loading && <p>Loading locations...</p>}
      {error && <p>Error loading locations: {errorMessage}</p>}
      <ul>
        {locations.map((location) => (
          <li key={location.id}>
            {location.name}
            <button onClick={() => handleAddStopFromLocation(location.id)}>Add as Stop</button>
          </li>
        ))}
      </ul>
    </div>

    {isMapVisible && (
      <div style={{ position: "relative", width: "100vw", height: "70vh" }}>
        <Map
          defaultZoom={9}
          defaultCenter={center}
          mapId={process.env.NEXT_PUBLIC_MAP_ID_RWANDA as string}
          fullscreenControl={false}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          reuseMaps={true}
          style={{ width: "100%", height: "100%" }}
        >
          <Directions stops={stops.map(stop => stop.coordinates)} />
          {stops.map((stop, index) => (
            <AdvancedMarker
              key={index}
              position={stop.coordinates}
              draggable={stop.isNew} // Disable dragging for fetched locations
              onDragEnd={(e) => handleMarkerDragEnd(index, e.latLng!)} // Update stop position and details when marker is moved
              onClick={() => handleShowActions(index)} // Show actions when marker is clicked
            />
          ))}
        </Map>

        {/* Show actions for the selected stop */}
        {selectedStopIndex !== null && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px", // Move to the right corner
              backgroundColor: "white",
              padding: "10px",
              borderRadius: "5px",
              boxShadow: "0 0 10px rgba(0,0,0,0.2)",
              zIndex: 1000 // Ensure it's on top of map elements
            }}
          >
            {stops[selectedStopIndex].isNew && (
              <button className="btn btn-outline btn-info" onClick={() => handleSaveStop(selectedStopIndex)}>
                Save Stop
              </button>
            )}
            <button className="btn btn-outline btn-warning" onClick={() => handleDeleteStop(selectedStopIndex)}>
              Delete Stop
            </button>
          </div>
        )}
      </div>
    )}
  </div>
</APIProvider>

  );
}



interface DirectionsProps {
  stops: google.maps.LatLng[];
}

function Directions({ stops }: DirectionsProps) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directions, setDirections] = useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();

  // Get the selected route from the Redux store (maintained state)
  const selectedRoute = useAppSelector((state) => state.route.selectedRoute);

  useEffect(() => {
    if (!map || !routesLibrary) return;

    setDirections(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [map, routesLibrary]);

  useEffect(() => {
    if (!directions || !directionsRenderer || !map || !selectedRoute) return;

    const originLatLng = new google.maps.LatLng(
      selectedRoute.origin.coordinates.lat,
      selectedRoute.origin.coordinates.lng
    );
    const destinationLatLng = new google.maps.LatLng(
      selectedRoute.destination.coordinates.lat,
      selectedRoute.destination.coordinates.lng
    );

    const waypoints = stops.map((stop) => ({
      location: stop,
      stopover: true,
    }));

    const request: google.maps.DirectionsRequest = {
      origin: originLatLng,
      destination: destinationLatLng,
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    directions.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);
      } else {
        console.error("Error fetching directions", status);
      }
    });
  }, [directions, directionsRenderer, map, stops, selectedRoute]);

  return null;
}
