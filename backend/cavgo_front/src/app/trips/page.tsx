"use client";
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ROUTES } from '@/lib/queries/queries';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { setSelectedRoute } from '@/lib/features/routeSlice';
import { setRouteId, removeStopPoint, updateStopPoint, setBoardingTime } from '@/lib/features/tripSlice';
import TripRender from '@/components/TripRender';
import { useLocations } from '@/hooks/useLocations';
import DateTimePicker from '@/components/DateTimePick';

interface Coordinates {
  lat: number;
  lng: number;
}

interface Location {
  id: string;
  name: string;
  coordinates: Coordinates;
}

interface Route {
  id: string;
  origin: Location;
  destination: Location;
  price: number;
}

const TripManagement = () => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [priceInput, setPriceInput] = useState<number | ''>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const { loading: routesLoading, error: routesError, data } = useQuery(GET_ROUTES);
  const { locations, loading: locationsLoading, error: locationsError } = useLocations();
  const dispatch = useDispatch();

  const selectedRoute = useSelector((state: RootState) => state.route.selectedRoute);
  const stopPoints = useSelector((state: RootState) => state.trip.stopPoints);

  if (routesLoading || locationsLoading) return <p>Loading routes and locations...</p>;
  if (routesError || locationsError) return <p>Error: {routesError?.message || locationsError?.message}</p>;

  const routes = data.getRoutes?.data || [];

  const handleRouteSelect = (route: Route) => {
    dispatch(setSelectedRoute(route));
    dispatch(setRouteId(route.id));
  };

  const getLocationNameById = (id: string) => {
    const location = locations.find(loc => loc.id === id);
    return location ? location.name : 'Unknown';
  };

  const handleRemoveStop = (index: number) => {
    dispatch(removeStopPoint(index));
  };

  const handleEditPrice = (index: number) => {
    setEditingIndex(index);
    setPriceInput(stopPoints[index].price || '');
  };

  const handleUpdatePrice = (index: number) => {
    if (priceInput !== '' && !isNaN(Number(priceInput))) {
      setIsUpdating(true);
      dispatch(updateStopPoint({ index, updatedData: { price: Number(priceInput) } }));
      setEditingIndex(null);
      setPriceInput('');
      setIsUpdating(false);
    } else {
      console.error('Invalid price input');
    }
  };

  const handleSetTime = (dateTime: string) => {
    dispatch(setBoardingTime(dateTime));
  };

  const renderTripDetails = () => {
    if (!selectedRoute) return <p>No route selected.</p>;

    return (
      <div>
        <p><strong>From:</strong> {selectedRoute.origin.name}</p>
        {stopPoints.length > 0 ? (
          stopPoints.map((stop, index) => (
            index === editingIndex ? (
              <div key={index}>
                <input
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(Number(e.target.value))}
                  placeholder="Enter price"
                  className="border p-1"
                />
                <button
                  onClick={() => handleUpdatePrice(index)}
                  disabled={isUpdating}
                  className="bg-green-500 text-white p-2 rounded ml-2"
                >
                  {isUpdating ? 'Updating...' : 'Update'}
                </button>
              </div>
            ) : (
              <div key={index}>
                <p><strong>To:</strong> {getLocationNameById(stop.locationId)} - {stop.price || 'Not set'}</p>
                <button
                  onClick={() => handleEditPrice(index)}
                  className="bg-blue-500 text-white p-2 rounded mr-2"
                >
                  Set Price
                </button>
                <button
                  onClick={() => handleRemoveStop(index)}
                  className="bg-red-500 text-white p-2 rounded"
                >
                  Remove
                </button>
              </div>
            )
          ))
        ) : (
          <p><strong>To:</strong> {selectedRoute.destination.name}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Trip Management</h1>

      <h2 className="text-xl font-semibold">Available Routes</h2>
      <ul className="list-disc list-inside">
        {routes.length > 0 ? (
          routes.map((route: Route) => (
            <li key={route.id}>
              {route.origin?.name.split(',')[0] || 'Unknown'} to {route.destination?.name.split(',')[0] || 'Unknown'} - {route.price} Rwf
              <button
                onClick={() => handleRouteSelect(route)}
                className="ml-4 bg-blue-500 text-white p-1 rounded"
              >
                Select
              </button>
            </li>
          ))
        ) : (
          <p>No routes available.</p>
        )}
      </ul>

      {selectedRoute && (
        <>
          <h2 className="text-xl font-semibold">Trip Details</h2>
          <div className="border p-4 rounded">
            {renderTripDetails()}
            <p><strong>Total Price:</strong> {selectedRoute.price} Rwf</p>
          </div>
          <DateTimePicker onSetTime={handleSetTime} />
        </>
      )}

      <TripRender />
    </div>
  );
};

export default TripManagement;
