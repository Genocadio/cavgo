"use client";
import { useEffect, useState } from "react";
import { APIProvider, Map, useMapsLibrary, useMap } from "@vis.gl/react-google-maps";
import { useAppSelector } from "@/lib/hooks"

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
const center = { lat: -1.9441, lng: 30.0619 }; // Kigali, Rwanda

export default function RouteViewer() {
  return (
    <APIProvider region="RW" apiKey={API_KEY}>
      <div style={{ height: "70vh", width: "100%" }}>
        <Map
          zoom={9}
          defaultCenter={center}
          mapId={process.env.NEXT_PUBLIC_MAP_ID_RWANDA as string}
          fullscreenControl={false}
        >
          <DirectionsRenderer />
        </Map>
      </div>
    </APIProvider>
  );
}




function DirectionsRenderer() {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directions, setDirections] = useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();

  // Accessing origin and destination from Redux state
  const { origin, destination } = useAppSelector(state => state.locations);

  useEffect(() => {
    if (!map || !routesLibrary) return;
    setDirections(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [map, routesLibrary]);

  useEffect(() => {
    if (!directions || !directionsRenderer || !map || !origin || !destination) return;

    const geocoder = new google.maps.Geocoder();

    // Geocode origin and destination based on their names from Redux state
    const geocodeLocation = (locationName: string): Promise<google.maps.LatLng> => {
      return new Promise((resolve, reject) => {
        geocoder.geocode({ address: locationName }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
            resolve(results[0].geometry.location);
          } else {
            reject(`Geocoding failed for ${locationName}: ${status}`);
          }
        });
      });
    };

    Promise.all([geocodeLocation(origin.name), geocodeLocation(destination.name)])
      .then(([originLatLng, destinationLatLng]) => {
        // Request route directions from Google Maps API
        directions
          .route({
            origin: originLatLng,
            destination: destinationLatLng,
            travelMode: google.maps.TravelMode.DRIVING,
            provideRouteAlternatives: false, // Single route, no alternatives needed
          })
          .then((response) => {
            directionsRenderer.setDirections(response);
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
      })
      .catch((error) => {
        console.error(error);
      });
  }, [directions, directionsRenderer, map, origin, destination]);

  return null; // No JSX needed since the map renders the route
}
