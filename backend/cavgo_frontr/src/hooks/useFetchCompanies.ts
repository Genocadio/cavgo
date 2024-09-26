// src/hooks/useFetchCompanies.ts
import { useQuery } from '@apollo/client';
import { GET_COMPANIES } from '@/lib/queries/queries'; // Adjust the import path as needed
import { ApolloError } from '@apollo/client';

interface Company {
  id: string;
  name: string;
}

interface UseFetchCompaniesResult {
  companies: Company[] | undefined;
  loading: boolean;
  error: ApolloError | undefined;
}

const useFetchCompanies = (): UseFetchCompaniesResult => {
  const { data, loading, error } = useQuery(GET_COMPANIES);

  return {
    companies: data?.getCompanies.data,
    loading,
    error,
  };
};

export default useFetchCompanies;
