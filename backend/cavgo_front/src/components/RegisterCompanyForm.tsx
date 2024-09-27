"use client";

import { useForm, SubmitHandler } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { REGISTER_COMPANY } from '@/lib/queries/mutations';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';

interface RegisterCompanyData {
  name: string;
  location: string;
  email: string;
}

const schema = yup.object().shape({
  name: yup.string().required('Company name is required'),
  location: yup.string().required('Location is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
});

const RegisterCompanyForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitSuccessful }, reset } = useForm<RegisterCompanyData>({
    resolver: yupResolver(schema),
  });

  const [registerCompany, { loading }] = useMutation(REGISTER_COMPANY);

  const onSubmit: SubmitHandler<RegisterCompanyData> = async (formData) => {
    try {
      const response = await registerCompany({ variables: formData });
      if (response.data?.registerCompany.success) {
        toast.success('Company registration successful!');
        reset(); // Clear the form on success
      } else {
        toast.error(response.data?.registerCompany.message || 'Registration failed.');
      }
    } catch (err) {
      toast.error('Error during registration. Please try again.');
      console.error('Error during registration:', err);
    }
  };

  // Reset form on successful submission
  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto">
      <div className="flex flex-col">
        <label htmlFor="name" className="mb-2 font-medium">Company Name</label>
        <input
          id="name"
          {...register('name')}
          className={`border p-2 rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Enter company name"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col">
        <label htmlFor="location" className="mb-2 font-medium">Location</label>
        <input
          id="location"
          {...register('location')}
          className={`border p-2 rounded ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Enter location"
        />
        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
      </div>

      <div className="flex flex-col">
        <label htmlFor="email" className="mb-2 font-medium">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={`border p-2 rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Enter email address"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-blue-500 text-white p-3 rounded transition duration-300 ${loading ? 'cursor-not-allowed' : 'hover:bg-blue-600'}`}
      >
        {loading ? (
          <div className="flex justify-center items-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            Processing...
          </div>
        ) : (
          'Register Company'
        )}
      </button>
    </form>
  );
};

export default RegisterCompanyForm;
