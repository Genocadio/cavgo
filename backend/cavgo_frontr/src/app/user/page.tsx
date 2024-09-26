"use client";
import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { TripData } from '@/lib/firebase/tripResponseTypes'; // Import the TripData interface
import { useAppDispatch } from '@/lib/hooks'; // Import the custom useAppDispatch hook
import { setOrigin, setDestination } from '@/lib/features/locationsSlice'; // Import actions from locationsSlice
import Link from 'next/link'; // Import Link for Next.js routing
import RouteViewer from '@/components/Routeviewer';

const TripFilter: React.FC = () => {
  const [trips, setTrips] = useState<TripData[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<TripData[]>([]);
  const [origin, setOriginState] = useState('');
  const [destination, setDestinationState] = useState('');
  const [availableOrigins, setAvailableOrigins] = useState<string[]>([]);
  const [availableDestinations, setAvailableDestinations] = useState<string[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<TripData | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [showMap, setShowMap] = useState<boolean>(false);
  const dispatch = useAppDispatch(); // Use the typed useAppDispatch hook

  useEffect(() => {
    const tripsCollection = collection(db, 'trips');
    const unsubscribe = onSnapshot(tripsCollection, (snapshot) => {
      const tripList: TripData[] = snapshot.docs.map(doc => ({
        ...(doc.data() as TripData),
      }));
      setTrips(tripList);
      setFilteredTrips(tripList);

      const origins = Array.from(new Set(tripList.map(trip => trip.route.origin.name)));
      setAvailableOrigins(origins);
    }, (error) => {
      console.error("Error fetching trips: ", error);
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error("Error fetching user location:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (origin) {
      const matchingTrips = trips.filter(trip => trip.route.origin.name === origin);
      const destinations = new Set<string>();

      matchingTrips.forEach(trip => {
        destinations.add(trip.route.destination.name);
        
        // Check if stopPoints exists and is an array before iterating
        if (Array.isArray(trip.route.stopPoints)) {
          trip.route.stopPoints.forEach(stop => destinations.add(stop.name));
        }
      });

      setAvailableDestinations(Array.from(destinations));
    } else {
      setAvailableDestinations([]);
    }
  }, [origin, trips]);

  const calculateDistance = (coords1: { lat: number; lng: number }, coords2: { lat: number; lng: number }): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const dLng = (coords2.lng - coords1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const handleFilter = () => {
    const filtered = trips.filter(trip => 
      trip.route.origin.name.toLowerCase().includes(origin.toLowerCase()) &&
      trip.route.destination.name.toLowerCase().includes(destination.toLowerCase())
    );

    if (userLocation) {
      const sortedTrips = filtered.sort((tripA, tripB) => {
        const distanceA = calculateDistance(userLocation, { lat: tripA.route.origin.coordinates.lat, lng: tripA.route.origin.coordinates.lng });
        const distanceB = calculateDistance(userLocation, { lat: tripB.route.origin.coordinates.lat, lng: tripB.route.origin.coordinates.lng });
        return distanceA - distanceB;
      });
      setFilteredTrips(sortedTrips);
    } else {
      setFilteredTrips(filtered);
    }
  };

  // Update the selected trip and dispatch origin and destination to the store
  const handleTripSelection = (trip: TripData) => {
    setSelectedTrip(trip);
    // Dispatch the full origin and destination objects to the store
    dispatch(setOrigin(trip.route.origin)); // Dispatching the full origin object
    dispatch(setDestination(trip.route.destination)); // Dispatching the full destination object
  };

  const formatDate = (timestampString: string): string => {
    const timestamp = Number(timestampString); // Convert string to number
    const date = new Date(timestamp);
    return date.toLocaleString(); // Converts to a readable date string
  };

  return (
    <div className="flex flex-col md:flex-row justify-between p-4 bg-base-100">
      <div className="md:w-2/3">
        <h2 className="text-2xl font-semibold mb-4">Filter Trips</h2>
        <button
          onClick={() => setShowMap(!showMap)}
          className="btn mb-4"
        >
          {showMap ? 'Hide Map' : 'Show Map'}
        </button>
        <div className="mb-4">
          <select value={origin} onChange={(e) => setOriginState(e.target.value)} className="select select-bordered w-full mb-2">
            <option value="">Select Origin</option>
            {availableOrigins.map((originName) => (
              <option key={originName} value={originName}>{originName}</option>
            ))}
          </select>

          <select value={destination} onChange={(e) => setDestinationState(e.target.value)} disabled={!origin} className="select select-bordered w-full">
            <option value="">Select Destination</option>
            {availableDestinations.map((destName) => (
              <option key={destName} value={destName}>{destName}</option>
            ))}
          </select>
        </div>

        <button onClick={handleFilter} className="btn btn-primary w-full mb-4">Filter</button>

        <div className="trip-list">
          {filteredTrips.length > 0 ? (
            filteredTrips.map((trip) => (
              <div key={trip.id} className="trip-item border p-4 mb-4 rounded-lg bg-base-200">
                <p className="font-semibold">{trip.route.origin.name} - Remaining Slots: {trip.availableSeats}</p>
                <p>Price: ${trip.route.price}</p>
                <p>Boarding Time: {formatDate(trip.boardingTime)}</p>
                <button onClick={() => handleTripSelection(trip)} className="btn btn-secondary mt-2">Select Trip</button>
                {selectedTrip?.id === trip.id && (
                  <Link href={`/book-trip/${trip.id}`}>
                    <button className="btn btn-accent mt-2">Book Trip</button>
                  </Link>
                )}
              </div>
            ))
          ) : (
            <p>No trips found for the selected criteria.</p>
          )}
        </div>
      </div>

      {showMap && (
        <div className="md:w-1/3 md:ml-4">
          <RouteViewer />
        </div>
      )}
    </div>
  );
};

export default TripFilter;
