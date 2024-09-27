// hooks/useLocations.ts
import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_LOCATIONS } from "@/lib/queries/queries";

interface Location {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export function useLocations() {
  const { data, loading, error } = useQuery(GET_LOCATIONS);

  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [filterQuery, setFilterQuery] = useState<string>("");

  useEffect(() => {
    if (data && data.getLocations.success) {
      setFilteredLocations(data.getLocations.data);
    } else if (error) {
      console.error("Failed to fetch locations", error);
    }
  }, [data, error]);

  useEffect(() => {
    if (data && data.getLocations.success) {
      const lowercasedQuery = filterQuery.toLowerCase();
      setFilteredLocations(
        data.getLocations.data.filter((location: Location) =>
          location.name.toLowerCase().includes(lowercasedQuery)
        )
      );
    }
  }, [filterQuery, data]);

  const filterLocations = (query: string) => {
    setFilterQuery(query);
  };

  return {
    locations: filteredLocations,
    loading,
    error,
    filterLocations
  };
}
