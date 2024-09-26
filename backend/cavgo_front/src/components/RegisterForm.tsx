"use client";
import { useForm, SubmitHandler } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { REGISTER_USER } from '@/lib/queries/mutations';
import { toast } from 'react-toastify';
import { yupResolver } from '@hookform/resolvers/yup';
import { validationSchema } from '@/lib/validationSchema'; // Adjust the import path as needed

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: yupResolver(validationSchema),
  });
  const [registerUser, { loading }] = useMutation(REGISTER_USER);

  const onSubmit: SubmitHandler<RegisterFormData> = async (formData) => {
    try {
      const response = await registerUser({ variables: { 
        firstName: formData.firstName, 
        lastName: formData.lastName, 
        email: formData.email, 
        phoneNumber: formData.phoneNumber, 
        password: formData.password 
      } });
      if (response.data?.registerUser.success) {
        toast.success('Registration successful!');
      } else {
        const message = response.data?.registerUser.message || 'Registration failed. Please check your inputs.';
        toast.error(message);
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again later.');
      console.error('Error during registration:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="firstName" className="block">First Name</label>
        <input
          id="firstName"
          {...register('firstName')}
          className="border p-2 rounded"
        />
        {errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>}
      </div>

      <div>
        <label htmlFor="lastName" className="block">Last Name</label>
        <input
          id="lastName"
          {...register('lastName')}
          className="border p-2 rounded"
        />
        {errors.lastName && <p className="text-red-500">{errors.lastName.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="border p-2 rounded"
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block">Phone Number</label>
        <input
          id="phoneNumber"
          {...register('phoneNumber')}
          className="border p-2 rounded"
        />
        {errors.phoneNumber && <p className="text-red-500">{errors.phoneNumber.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block">Password</label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="border p-2 rounded"
        />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          className="border p-2 rounded"
        />
        {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`bg-blue-500 text-white p-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default RegisterForm;
