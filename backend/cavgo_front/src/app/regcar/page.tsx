"use client"
import { useMutation } from '@apollo/client';
import { REGISTER_CAR } from '@/lib/queries/mutations'; // Adjust path as necessary
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify'; // For displaying notifications
import useFetchCompanies from '@/hooks/useFetchCompanies'; // Adjust path as necessary


interface RegisterCarFormData {
  plateNumber: string;
  numberOfSeats: number;
  ownerCompanyId?: string;
  privateOwner?: string;
  driverId?: string;
  // isOccupied?: boolean;
}

const RegisterCar = () => {
  const { companies, loading: companiesLoading, error: companiesError } = useFetchCompanies();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterCarFormData>();
  const [registerCar] = useMutation(REGISTER_CAR);

  const onSubmit: SubmitHandler<RegisterCarFormData> = async (data) => {
    // Check that either ownerCompanyId or privateOwner is provided, but not both
    if (data.ownerCompanyId && data.privateOwner) {
      toast.error('You cannot provide both an owner company and a private owner.');
      return;
    }

    if (!data.ownerCompanyId && !data.privateOwner) {
      toast.error('You must provide either an owner company or a private owner.');
      return;
    }

    try {
      const { data: response } = await registerCar({
        variables: {
          plateNumber: data.plateNumber,
          numberOfSeats: data.numberOfSeats,
          ownerCompanyId: data.ownerCompanyId || null,
          privateOwner: data.privateOwner || null,
          driverId: data.driverId || null,
          
        },
      });
      if (response.registerCar.success) {
        toast.success('Car registered successfully!');
      } else {
        toast.error(response.registerCar.message || 'Registration failed.');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
      console.error('Registration error:', err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="plateNumber" className="block">Plate Number</label>
          <input
            id="plateNumber"
            type="text"
            placeholder="Plate Number"
            {...register('plateNumber', { required: 'Plate number is required' })}
            className="border p-2 w-full"
          />
          {errors.plateNumber && <p className="text-red-500">{errors.plateNumber.message}</p>}
        </div>
        
        <div>
          <label htmlFor="numberOfSeats" className="block">Number of Seats</label>
          <input
            id="numberOfSeats"
            type="number"
            placeholder="Number of Seats"
            {...register('numberOfSeats', { required: 'Number of seats is required', valueAsNumber: true })}
            className="border p-2 w-full"
          />
          {errors.numberOfSeats && <p className="text-red-500">{errors.numberOfSeats.message}</p>}
        </div>
        
        <div>
          <label htmlFor="ownerCompanyId" className="block">Owner Company</label>
          <select
            id="ownerCompanyId"
            {...register('ownerCompanyId')}
            className="border p-2 w-full"
          >
            <option value="">Select a company (optional)</option>
            {companiesLoading && <option>Loading...</option>}
            {companiesError && <option>Error loading companies</option>}
            {companies && companies.map(company => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="privateOwner" className="block">Private Owner</label>
          <input
            id="privateOwner"
            type="text"
            placeholder="Private Owner"
            {...register('privateOwner')}
            className="border p-2 w-full"
          />
        </div>
        
        <div>
          <label htmlFor="driverId" className="block">Driver ID (Optional)</label>
          <input
            id="driverId"
            type="text"
            placeholder="Driver ID"
            {...register('driverId')}
            className="border p-2 w-full"
          />
        </div>
        
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white p-2 rounded w-full"
        >
          {isSubmitting ? 'Registering...' : 'Register Car'}
        </button>
      </form>
    </div>
  );
};

export default RegisterCar;
