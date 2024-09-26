"use client"; // Make sure this is at the top of your file
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import from 'next/navigation' for App Router
import useLogin from '@/hooks/useLogin'; // Adjust the import path as necessary

const Login = () => {
  const router = useRouter(); // Initialize useRouter
  const {
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    loading,
    error,
    loginSuccess,
  } = useLogin();

  useEffect(() => {
    // Redirect to home page if login is successful
    if (loginSuccess) {
      router.push('/'); // Change this to your desired route
    }
  }, [loginSuccess, router]); // Include loginSuccess and router in the dependency array

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="text-2xl font-semibold text-center">Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            {/* Display success message or additional information */}
            {loginSuccess && (
              <p className="text-green-500 text-center">You are logged in successfully!</p>
            )}
            
            {error && (
              <p className="text-red-500 text-center">Login failed. Please check your credentials.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
