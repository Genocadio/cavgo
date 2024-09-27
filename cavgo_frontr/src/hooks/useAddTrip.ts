import { useMutation } from '@apollo/client';
import { ADD_TRIP } from '@/lib/queries/mutations'; // Adjust the path as needed
import { TripData } from '@/lib/firebase/tripResponseTypes'; // Adjust the import path as necessary

interface AddTripInput {
  routeId: string;
  carId: string;
  boardingTime: string;
  status?: string;
  stopPoints: { locationId: string; price: number }[];
  reverseRoute?: boolean;
}

interface AddTripResponse {
  addTrip: {
    success: boolean;
    message?: string;
    data?: TripData; // Ensure data matches the TripData structure
  };
}

export function useAddTrip() {
  const [addTrip, { data, loading, error }] = useMutation<AddTripResponse>(ADD_TRIP);

  const addNewTrip = async (input: AddTripInput) => {
    try {
      const result = await addTrip({ variables: input });
      return result.data?.addTrip; // This should correctly reference the TripData
    } catch (err) {
      console.error("Error adding trip:", err);
      throw new Error("Failed to add trip. Please try again.");
    }
  };

  return { addNewTrip, data, loading, error: error?.message }; // Returning error message directly
}
