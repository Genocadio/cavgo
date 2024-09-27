import React from 'react';
import { useFetchCars } from '@/hooks/useFetchCars';  // Custom hook to fetch cars
import { setCarId, setAvailableSeats } from '@/lib/features/tripSlice';  // Redux actions
import { useAppSelector, useAppDispatch } from '@/lib/hooks';  // Custom typed hooks
import { useAddTrip } from '@/hooks/useAddTrip';  // Custom hook to add trip
import { saveTripToFirebase } from '@/lib/firebase/firebaseTripUtils';  // Function to save trip to Firebase
import { TripData } from '@/lib/firebase/tripResponseTypes';

interface Car {
  id: string;
  plateNumber: string;
  numberOfSeats: number;
  ownerCompany?: { name: string };  // Optional field for owner company
  privateOwner?: string;            // Optional field for private owner
  isOccupied: boolean;              // Indicates if the car is occupied
}

const CarSelection: React.FC = () => {
  const dispatch = useAppDispatch();  // Using the custom typed dispatch
  const { cars, loading, error } = useFetchCars();  // Fetching cars from the custom hook

  const selectedCarId = useAppSelector((state) => state.trip.carId);  // Using the custom typed selector
  const availableSeats = useAppSelector((state) => state.trip.availableSeats);  // Get available seats from Redux
  const boardingTime = useAppSelector((state) => state.trip.boardingTime);  // Get boarding time from Redux
  const routeId = useAppSelector((state) => state.trip.routeId);  // Get route ID from Redux
  const stopPoints = useAppSelector((state) => state.trip.stopPoints);  // Get stop points from Redux
  const reverseRoute = useAppSelector((state) => state.trip.reverseRoute);  // Get reverseRoute from Redux

  const { addNewTrip } = useAddTrip();  // Using the custom hook for adding trips

  // Function to handle selecting a car
  const handleCarSelect = (carId: string, numberOfSeats: number) => {
    dispatch(setCarId(carId));  // Set the selected car ID in the trip slice
    dispatch(setAvailableSeats(numberOfSeats));  // Set the number of available seats for the trip
  };

  // Function to handle adding a trip
  const handleAddTrip = async () => {
    // Check for empty fields in Redux state
    if (!routeId || !selectedCarId || !boardingTime || availableSeats <= 0 || stopPoints.length === 0) {
      const emptyFields: string[] = [];
      if (!routeId) emptyFields.push('Route ID');
      if (!selectedCarId) emptyFields.push('Car ID');
      if (!boardingTime) emptyFields.push('Boarding Time');
      if (stopPoints.length === 0) emptyFields.push('Stop Points');
      if (availableSeats <= 0) emptyFields.push('Available Seats');
  
      // Log and alert empty fields
      console.error("Missing required fields:", emptyFields.join(', '));
      alert(`Please fill all required fields before adding the trip: ${emptyFields.join(', ')}`);
      return;
    }
  
    // Create trip data
    const tripData = {
      routeId,
      carId: selectedCarId,
      boardingTime,
      status: 'Scheduled',  // Default status
      stopPoints,
      reverseRoute: reverseRoute || false,  // Default reverseRoute
    };
  
    // Proceed to create trip
    try {
      const response = await addNewTrip(tripData);
      if (response?.success && response.data) {
        alert("Trip added successfully!");
        const tripDetails: TripData = response.data; // Expecting this to match TripData structure
        console.log("Trip details:", tripDetails);
  
        // Save trip to Firebase
        if (tripDetails) {
            await saveTripToFirebase(tripDetails);
        }
      } else {
        alert(`Error adding trip: ${response?.message}`);
      }
    } catch (err) {
      console.error("Error adding trip:", err);
      alert("An error occurred while adding the trip.");
    }
  };
  

  if (loading) return <p>Loading cars...</p>;
  if (error) return <p>Error fetching cars: {error.message}</p>;

  return (
    <div>
      <h3>Select a Car</h3>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {cars
          .filter((car: Car) => !car.isOccupied)  // Filter out occupied cars
          .map((car: Car) => (
            <li key={car.id} style={{ marginBottom: '10px' }}>
              <button
                onClick={() => handleCarSelect(car.id, car.numberOfSeats)}
                style={{
                  backgroundColor: selectedCarId === car.id ? 'lightblue' : 'transparent',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                {/* Display car details */}
                {car.plateNumber} - {car.numberOfSeats} seats
                {car.ownerCompany && <span> - {car.ownerCompany.name}</span>}
              </button>
            </li>
          ))}
      </ul>

      <button onClick={handleAddTrip} style={{ marginTop: '10px', padding: '10px' }}>
        Add Trip
      </button>
    </div>
  );
};

export default CarSelection;
