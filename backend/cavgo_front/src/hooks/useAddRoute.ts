// hooks/useAddRoute.ts
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { ADD_ROUTE } from "@/lib/queries/mutations"; // Adjust import to match your file structure

interface AddRouteVariables {
  originId: string;
  destinationId: string;
  googleMapsRouteId: string;
  price: number;
}

export function useAddRoute() {
  const [addRoute, { data, loading, error }] = useMutation(ADD_ROUTE);

  const executeAddRoute = async (variables: AddRouteVariables) => {
    try {
      const result = await addRoute({ variables });
      if (result.data?.addRoute.success) {
        toast.success("Route added successfully!");
      } else {
        toast.error(result.data?.addRoute.message || "Failed to add route.");
      }
      return result.data;
    } catch (error) {
      console.error("Error adding route:", error);
      toast.error("An error occurred while adding the route.");
      throw error;
    }
  };

  return { executeAddRoute, data, loading, error };
}
