"use client";

import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GET_LOCATIONS } from '@/lib/queries/queries';  // Adjust import path
import { useAppDispatch } from '@/lib/hooks';  // Redux hook for dispatching actions
import { setOrigin, setDestination, setPrice } from '@/lib/features/routesSlice';
import RouterRender from '@/components/RouterRender';
import 'daisyui/dist/full.css';

interface Location {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
}

interface FormData {
  originId: string;
  destinationId: string;
  price: number;
}

// Yup validation schema ensuring origin and destination are different
const validationSchema = Yup.object().shape({
  originId: Yup.string().required('Origin is required'),
  destinationId: Yup.string()
    .required('Destination is required')
    .test('different-locations', 'Origin and destination must be different', function (value) {
      return value !== this.parent.originId;
    }),
  price: Yup.number().required('Price is required').positive('Price must be a positive number'),
});

const RouteManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();  // Redux dispatch function
  const { loading, error, data } = useQuery(GET_LOCATIONS);
  const { register, setValue, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
  });
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (data) {
      setLocations(data.getLocations.data);  // Set locations once data is available
    }
  }, [data]);

  // Handle origin change, dispatch origin and update form value
  const handleOriginChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const originId = e.target.value;
    dispatch(setOrigin(originId));
    setValue('originId', originId);  // Update form value for validation
  };

  // Handle destination change, dispatch destination and update form value
  const handleDestinationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const destinationId = e.target.value;
    dispatch(setDestination(destinationId));
    setValue('destinationId', destinationId);  // Update form value for validation
  };

  // Handle price change, dispatch price and update form value
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const price = parseFloat(e.target.value);
    if (!isNaN(price)) {
      dispatch(setPrice(price));
      setValue('price', price);  // Update form value for validation
    }
  };

  if (loading) return <p>Loading locations...</p>;
  if (error) return <p>Error loading locations: {error.message}</p>;

  return (
    <div className="container mx-auto p-5">
      <h2 className="text-3xl font-bold text-center mb-8">Route Management</h2>

      <form className="form-control space-y-4">
        {/* Origin Selection */}
        <div className="form-control">
          <label htmlFor="originId" className="label">
            <span className="label-text font-semibold">Select Origin</span>
          </label>
          <select
            id="originId"
            className={`select select-bordered w-full ${errors.originId ? 'border-red-500' : ''}`}
            {...register('originId')}
            onChange={handleOriginChange}  // Trigger Redux dispatch on change
          >
            <option value="">-- Select Origin --</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name} - {location.address}
              </option>
            ))}
          </select>
          {errors.originId && <p className="text-red-500 text-sm">{errors.originId.message}</p>}
        </div>

        {/* Destination Selection */}
        <div className="form-control">
          <label htmlFor="destinationId" className="label">
            <span className="label-text font-semibold">Select Destination</span>
          </label>
          <select
            id="destinationId"
            className={`select select-bordered w-full ${errors.destinationId ? 'border-red-500' : ''}`}
            {...register('destinationId')}
            onChange={handleDestinationChange}  // Trigger Redux dispatch on change
          >
            <option value="">-- Select Destination --</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name} - {location.address}
              </option>
            ))}
          </select>
          {errors.destinationId && <p className="text-red-500 text-sm">{errors.destinationId.message}</p>}
        </div>

        {/* Price Input */}
        <div className="form-control">
          <label htmlFor="price" className="label">
            <span className="label-text font-semibold">Price</span>
          </label>
          <input
            type="number"
            id="price"
            className={`input input-bordered w-full ${errors.price ? 'border-red-500' : ''}`}
            step="0.01"
            {...register('price')}
            onChange={handlePriceChange}  // Trigger Redux dispatch on input change
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
        </div>
      </form>

      <ToastContainer />
      <RouterRender /> {/* Renders the routing view */}
    </div>
  );
};

export default RouteManagementPage;
