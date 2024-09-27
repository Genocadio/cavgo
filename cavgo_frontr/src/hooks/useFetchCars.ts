import { useQuery } from '@apollo/client';
import { GET_CARS_QUERY } from '@/lib/queries/queries';


export const useFetchCars = () => {
  const { loading, error, data } = useQuery(GET_CARS_QUERY);

  return {
    loading,
    error,
    cars: data?.getCars?.data || [],
  };
};
