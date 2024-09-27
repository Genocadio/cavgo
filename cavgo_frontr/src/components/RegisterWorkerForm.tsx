// src/components/RegisterWorkerForm.tsx
"use client";

import { useForm, SubmitHandler } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { REGISTER_USER } from '@/lib/queries/mutations';
import useFetchCompanies from '@/hooks/useFetchCompanies'; // Adjust the import path as needed
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

interface RegisterWorkerData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  companyId: string;
}

const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  password: yup.string().required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  companyId: yup.string().required('Company is required'),
});

const RegisterWorkerForm: React.FC = () => {
  const { companies, loading: companiesLoading, error: companiesError } = useFetchCompanies();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterWorkerData>({
    resolver: yupResolver(schema),
  });
  const [registerUser, { loading: registerLoading }] = useMutation(REGISTER_USER);

  const onSubmit: SubmitHandler<RegisterWorkerData> = async (formData) => {
    try {
      const response = await registerUser({ variables: formData });
      if (response.data?.registerUser.success) {
        toast.success('Worker registration successful!');
      } else {
        toast.error(response.data?.registerUser.message || 'Registration failed.');
      }
    } catch (err) {
      toast.error('Error during registration. Please try again.');
      console.error('Error during registration:', err);
    }
  };

  if (companiesLoading) {
    return <p>Loading companies...</p>; // Optionally, you could add a spinner or more styled loading indicator
  }

  if (companiesError) {
    return <p>Error loading companies: {companiesError.message}</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="form-control w-full">
        <label htmlFor="firstName" className="label">
          <span className="label-text">First Name</span>
        </label>
        <input id="firstName" {...register('firstName')} className="input input-bordered w-full" />
        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
      </div>

      <div className="form-control w-full">
        <label htmlFor="lastName" className="label">
          <span className="label-text">Last Name</span>
        </label>
        <input id="lastName" {...register('lastName')} className="input input-bordered w-full" />
        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
      </div>

      <div className="form-control w-full">
        <label htmlFor="email" className="label">
          <span className="label-text">Email</span>
        </label>
        <input id="email" type="email" {...register('email')} className="input input-bordered w-full" />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <div className="form-control w-full">
        <label htmlFor="phoneNumber" className="label">
          <span className="label-text">Phone Number</span>
        </label>
        <input id="phoneNumber" {...register('phoneNumber')} className="input input-bordered w-full" />
        {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>}
      </div>

      <div className="form-control w-full">
        <label htmlFor="password" className="label">
          <span className="label-text">Password</span>
        </label>
        <input id="password" type="password" {...register('password')} className="input input-bordered w-full" />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      </div>

      <div className="form-control w-full">
        <label htmlFor="confirmPassword" className="label">
          <span className="label-text">Confirm Password</span>
        </label>
        <input id="confirmPassword" type="password" {...register('confirmPassword')} className="input input-bordered w-full" />
        {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
      </div>

      <div className="form-control w-full">
        <label htmlFor="companyId" className="label">
          <span className="label-text">Company</span>
        </label>
        <select id="companyId" {...register('companyId')} className="select select-bordered w-full">
          <option value="">Select a company</option>
          {companies?.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
        {errors.companyId && <p className="text-red-500 text-sm">{errors.companyId.message}</p>}
      </div>

      <button type="submit" disabled={registerLoading} className="btn btn-primary w-full">
        {registerLoading ? 'Registering...' : 'Register Worker'}
      </button>
    </form>
  );
};

export default RegisterWorkerForm;
