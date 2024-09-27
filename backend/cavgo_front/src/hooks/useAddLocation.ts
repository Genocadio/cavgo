import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { ADD_LOCATION } from "@/lib/queries/mutations";
import { GET_LOCATIONS } from "@/lib/queries/queries";
import { GetLocationsData } from "@/lib/types"; // Adjust import path as needed

export const useAddLocation = () => {
    const [addLocation, { data, loading, error }] = useMutation(ADD_LOCATION, {
        update(cache, { data: { addLocation } }) {
            if (addLocation.success) {
                // Read the current cached data for GET_LOCATIONS query
                const existingLocations = cache.readQuery<GetLocationsData>({
                    query: GET_LOCATIONS,
                    variables: {} // Pass any variables used in GET_LOCATIONS if required
                });

                if (existingLocations) {
                    // Create the new location object
                    const newLocation = addLocation.data;

                    // Write the updated data to the cache
                    cache.writeQuery({
                        query: GET_LOCATIONS,
                        data: {
                            getLocations: {
                                ...existingLocations.getLocations,
                                data: [
                                    ...existingLocations.getLocations.data,
                                    newLocation,
                                ],
                            },
                        },
                    });
                }
            }
        },
    });

    const handleAddLocation = async (input: {
        name: string;
        type: string;
        coordinates: { lat: number; lng: number };
        address: string;
        googlePlaceId: string;
    }) => {
        try {
            const result = await addLocation({ variables: input });
            if (result.data?.addLocation.success) {
                toast.success("Location added successfully!");
            } else {
                toast.error(result.data?.addLocation.message || "Failed to add location.");
            }
            return result.data?.addLocation;
        } catch (err) {
            console.error("Error adding location:", err);
            toast.error("An error occurred while adding the location.");
            throw err;
        }
    };

    return {
        handleAddLocation,
        data,
        loading,
        error,
    };
};
