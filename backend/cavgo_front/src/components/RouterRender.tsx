"use client";
import { useEffect, useState } from "react";
import { APIProvider, Map, useMapsLibrary, useMap } from "@vis.gl/react-google-maps";
import { useAppSelector } from "@/lib/hooks";
import { useApolloClient } from "@apollo/client";
import { useAddRoute } from "@/hooks/useAddRoute";
import { GET_LOCATIONS } from "@/lib/queries/queries";  // Adjust import to match your file structure


const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
const center = { lat: -1.9441, lng: 30.0619 }; // Kigali, Rwanda

export default function MapRoutes() {
  return (
    <APIProvider region="RW" apiKey={API_KEY}>
      <div style={{ height: "70vh", width: "100%" }}>
        <Map
          zoom={9}
          defaultCenter={center}
          mapId={process.env.NEXT_PUBLIC_MAP_ID_RWANDA as string}
          fullscreenControl={false}
        >
          <Directions />
        </Map>
      </div>
    </APIProvider>
  );
}

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

  function Directions() {
    const map = useMap();
    const routesLibrary = useMapsLibrary("routes");
    const [directions, setDirections] = useState<google.maps.DirectionsService>();
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();
    const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
    const [routeIndex, setRouteIndex] = useState(0);
    const selected = routes[routeIndex];
    const leg = selected?.legs[0];
  
    const { originId, destinationId, price } = useAppSelector((state) => state.routes);
  
    // Apollo Client to access the cache
    const client = useApolloClient();
  
    // Function to get the location by ID from the Apollo Client cache
    const getLocationById = (locationId: string) => {
      const cacheData = client.readQuery({ query: GET_LOCATIONS });
      if (cacheData && cacheData.getLocations && cacheData.getLocations.data) {
        return cacheData.getLocations.data.find((location: Locate) => location.id === locationId);
      }
      return null;
    };
  
    // Fetch the corresponding location names using IDs from Redux state
    const originLocation = getLocationById(originId || "defaultOriginId");
    const destinationLocation = getLocationById(destinationId || "defaultDestinationId");
  
    useEffect(() => {
      if (!map || !routesLibrary) return;
      setDirections(new routesLibrary.DirectionsService());
      setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
    }, [map, routesLibrary]);
  
    useEffect(() => {
      if (!directionsRenderer) return;
      directionsRenderer.setRouteIndex(routeIndex);
    }, [routeIndex, directionsRenderer]);
  
    useEffect(() => {
      if (!directions || !directionsRenderer || !map || !originLocation || !destinationLocation) return;
  
      const geocoder = new google.maps.Geocoder();
  
      // Geocode the origin address using the name from the cache
      geocoder.geocode({ address: originLocation.name }, (originResults, originStatus) => {
        if (originStatus === google.maps.GeocoderStatus.OK && originResults) {
          const originLatLng = originResults[0].geometry.location;
  
          // Geocode the destination address using the name from the cache
          geocoder.geocode({ address: destinationLocation.name }, (destinationResults, destinationStatus) => {
            if (destinationStatus === google.maps.GeocoderStatus.OK && destinationResults) {
              const destinationLatLng = destinationResults[0].geometry.location;
  
              // Now we have both the origin and destination coordinates, we can request directions
              directions
                .route({
                  origin: originLatLng,
                  destination: destinationLatLng,
                  travelMode: google.maps.TravelMode.DRIVING,
                  provideRouteAlternatives: true,
                })
                .then((response) => {
                  directionsRenderer.setDirections(response);
                  setRoutes(response.routes);
  
                  // Fit the map to the route bounds
                  const bounds = new google.maps.LatLngBounds();
                  response.routes.forEach((route) => {
                    route.legs.forEach((leg) => {
                      bounds.extend(leg.start_location);
                      bounds.extend(leg.end_location);
                    });
                  });
                  map.fitBounds(bounds);
                })
                .catch((error) => {
                  console.error("Error fetching directions:", error);
                });
            } else {
              console.error("Error geocoding destination address:", destinationStatus);
            }
          });
        } else {
          console.error("Error geocoding origin address:", originStatus);
        }
      });
    }, [directions, directionsRenderer, map, originLocation, destinationLocation]);
  
    // Use the custom hook
    const { executeAddRoute } = useAddRoute();
  
    // Function to handle button click
    const handleButtonClick = async (routeId: string) => {
      try {
        // const price = 10.0; // Set the price you want to use or calculate dynamically
        await executeAddRoute({
          originId: originId || "defaultOriginId",
          destinationId: destinationId || "defaultDestinationId",
          googleMapsRouteId: routeId,
          price: price || 0,
        });
        console.log("Route added successfully");
      } catch (error) {
        console.error("Error adding route:", error);
      }
    };
  
    if (!leg || !selected) return null;
  
    return (
      <div>
        <h2>{selected.summary}</h2>
        <p>{leg.start_address.split(",")[0]} to {leg.end_address.split(",")[0]}</p>
        <p>{leg.distance?.text}</p>
        <h2>Other routes</h2>
        <ul>
          {routes.map((route, index) => (
            <li key={route.summary}>
              <button onClick={() => setRouteIndex(index)}>{route.summary}</button>
            </li>
          ))}
        </ul>
        {/* Display the button if route data is available */}
        {selected && price && (
          <button onClick={() => handleButtonClick(selected.summary)}>Add Route</button>
        )}
      </div>
    );
  }