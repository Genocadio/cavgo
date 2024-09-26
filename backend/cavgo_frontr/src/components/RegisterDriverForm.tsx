"use client"
import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { REGISTER_DRIVER } from '@/lib/queries/mutations';
import useFetchCompanies from '@/hooks/useFetchCompanies'; // Use the custom hook

interface RegisterDriverData {
  name: string;
  email?: string; // Make email optional
  phoneNumber: string;
  type: 'private' | 'company'; // Specific types for validation
  license?: string; // Make license optional
  companyId?: string; // Optional field for 'private' type
  password: string;
  confirmPassword: string; // New field for password confirmation
}

const RegisterDriverForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<RegisterDriverData>({
    mode: 'onChange',
  });

  const driverType = watch('type'); // Watch the value of 'type'

  // Mutation hook for registering a driver
  const [registerDriver, { loading }] = useMutation(REGISTER_DRIVER);
  const { companies, loading: loadingCompanies, error } = useFetchCompanies(); // Fetch companies

  // Effect to reset companyId when type changes
  useEffect(() => {
    if (driverType !== 'company') {
      setValue('companyId', '');
    }
  }, [driverType, setValue]);

  // Form submit handler
  const onSubmit: SubmitHandler<RegisterDriverData> = async (formData) => {
    try {
      if (driverType === 'company' && !formData.companyId) {
        toast.error('Please select a company.');
        return;
      }

      // Mutation call with form data
      const response = await registerDriver({ variables: { ...formData } });
      if (response.data?.registerDriver.success) {
        toast.success('Driver registration successful!');
      } else {
        toast.error(response.data?.registerDriver.message || 'Registration failed.');
      }
    } catch (err) {
      toast.error('Error during registration. Please try again.');
      console.error('Error during registration:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6 bg-white shadow-lg rounded-lg">
      <div className="form-control w-full">
        <label htmlFor="name" className="label">
          <span className="label-text">Name</span>
        </label>
        <input id="name" {...register('name')} className="input input-bordered w-full" />
        {errors.name && <p className="text-error">{errors.name.message}</p>}
      </div>

      <div className="form-control w-full">
        <label htmlFor="email" className="label">
          <span className="label-text">Email</span>
        </label>
        <input id="email" type="email" {...register('email')} className="input input-bordered w-full" />
        {errors.email && <p className="text-error">{errors.email.message}</p>}
      </div>

      <div className="form-control w-full">
        <label htmlFor="phoneNumber" className="label">
          <span className="label-text">Phone Number</span>
        </label>
        <input id="phoneNumber" {...register('phoneNumber')} className="input input-bordered w-full" />
        {errors.phoneNumber && <p className="text-error">{errors.phoneNumber.message}</p>}
      </div>

      <div className="form-control w-full">
        <label htmlFor="type" className="label">
          <span className="label-text">Type</span>
        </label>
        <select id="type" {...register('type')} className="select select-bordered w-full">
          <option value="">Select Type</option>
          <option value="private">Private</option>
          <option value="company">Company</option>
        </select>
        {errors.type && <p className="text-error">{errors.type.message}</p>}
      </div>

      {/* Conditionally render the company dropdown based on 'company' type */}
      {driverType === 'company' && !loadingCompanies && companies && companies?.length > 0 && (
        <div className="form-control w-full">
          <label htmlFor="companyId" className="label">
            <span className="label-text">Company</span>
          </label>
          <select id="companyId" {...register('companyId')} className="select select-bordered w-full">
            <option value="">Select a company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          {errors.companyId && <p className="text-error">{errors.companyId.message}</p>}
        </div>
      )}

      {/* Show message if no companies available */}
      {driverType === 'company' && !loadingCompanies && companies?.length === 0 && (
        <p className="text-error">Company registration is not available now.</p>
      )}

      {/* Loading message while fetching companies */}
      {driverType === 'company' && loadingCompanies && (
        <p>Loading companies...</p>
      )}

      {/* Error message if company fetch fails */}
      {error && (
        <p className="text-error">Failed to load companies. Try again later.</p>
      )}

      <div className="form-control w-full">
        <label htmlFor="license" className="label">
          <span className="label-text">License</span>
        </label>
        <input id="license" {...register('license')} className="input input-bordered w-full" />
        {errors.license && <p className="text-error">{errors.license.message}</p>}
      </div>

      <div className="form-control w-full">
        <label htmlFor="password" className="label">
          <span className="label-text">Password</span>
        </label>
        <input id="password" type="password" {...register('password')} className="input input-bordered w-full" />
        {errors.password && <p className="text-error">{errors.password.message}</p>}
      </div>

      <div className="form-control w-full">
        <label htmlFor="confirmPassword" className="label">
          <span className="label-text">Confirm Password</span>
        </label>
        <input id="confirmPassword" type="password" {...register('confirmPassword')} className="input input-bordered w-full" />
        {errors.confirmPassword && <p className="text-error">{errors.confirmPassword.message}</p>}
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? 'Registering...' : 'Register Driver'}
      </button>
    </form>
  );
};

export default RegisterDriverForm;
