import { useState } from 'react';
import { useMutation } from '@apollo/client';

import { LOGIN_USER } from '@/lib/queries/mutations'; // Adjust the import path as necessary
import { toast } from 'react-toastify'; // For displaying notifications

const useLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginUser, { loading, error }] = useMutation(LOGIN_USER);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await loginUser({ variables: { email, password } });
      if (data?.loginUser.success) {
        const token = data.loginUser.data.token;
        localStorage.setItem('authToken', token); // Store token in local storage
        setLoginSuccess(true); // Set login success state
        ; // Redirect to dashboard page
        toast.success('Login successful!');
      } else {
        toast.error(data?.loginUser.message || 'Login failed.');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
      console.error('Login error:', err);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    loading,
    error,
    loginSuccess,
  };
};

export default useLogin;
