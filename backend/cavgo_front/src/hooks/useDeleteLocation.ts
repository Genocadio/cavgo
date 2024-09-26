/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from '@apollo/client';
import { DELETE_LOCATION } from '@/lib/queries/mutations';
import { toast } from 'react-toastify';

// Hook for deleting location
export const useDeleteLocation = () => {
  const [deleteLocationMutation] = useMutation(DELETE_LOCATION, {
    onCompleted: () => {
      toast.success("Location deleted successfully");
    },
    onError: () => {
      toast.error("Error deleting location");
    }
  });

  const deleteLocation = (id: string) => {
    deleteLocationMutation({ variables: { deleteLocationId: id } });
  };

  return { deleteLocation };
};
