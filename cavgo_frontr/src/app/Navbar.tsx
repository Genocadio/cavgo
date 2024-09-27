"use client"; // Ensure this page is treated as a client component

import React from 'react';
import Link from 'next/link'; // Import Link for navigation
import { toast } from 'react-toastify'; // Import toast for notifications

const Navbar: React.FC = () => {
  const handleLogout = () => {
    // Remove the logged-in user and auth token from local storage
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('authToken'); // Also remove the auth token
    toast.success('Logout successful!'); // Show logout success message
    window.location.href = '/login'; // Redirect to login page
  };

  // Check if a user is logged in by verifying the presence of the auth token
//   const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('loggedInUser') || 'null') : null;
  const isLoggedIn = typeof window !== 'undefined' ? localStorage.getItem('authToken') !== null : false;

  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link href="/user" className="btn btn-ghost text-xl">
          CAVGO
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          {isLoggedIn ? (
            <>
              <li>
                <button className="btn btn-ghost" ><Link href="/">Dashboard</Link></button>
              </li>
              <li>
                <button className="btn btn-ghost" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/login">Login</Link>
              </li>
              <li>
                <Link href="/register">Register</Link>
              </li>
            </>
          )}
          <li>
 
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
