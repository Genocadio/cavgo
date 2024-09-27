"use client"; // Ensure this page is treated as a client component

import React from 'react';
import Link from 'next/link'; // Import Link for navigation

const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">

        {/* Manage Locations Card */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Manage Locations</h2>
            <p>View and manage all locations.</p>
            <div className="card-actions justify-end">
              <Link href="/manloc">
                <button className="btn btn-primary">Go to Locations</button>
              </Link>
            </div>
          </div>
        </div>

        {/* Register Company Card */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Register Company</h2>
            <p>Add new companies to the system.</p>
            <div className="card-actions justify-end">
              <Link href="/reg-comp">
                <button className="btn btn-primary">Go to Registration</button>
              </Link>
            </div>
          </div>
        </div>

        {/* Register Driver Card */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Register Driver</h2>
            <p>Add new drivers to the system.</p>
            <div className="card-actions justify-end">
              <Link href="/reg-d">
                <button className="btn btn-primary">Go to Registration</button>
              </Link>
            </div>
          </div>
        </div>

        {/* Register Vehicle Card */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Register Vehicle</h2>
            <p>Add new vehicles to the system.</p>
            <div className="card-actions justify-end">
              <Link href="/regcar">
                <button className="btn btn-primary">Go to Registration</button>
              </Link>
            </div>
          </div>
        </div>

        {/* Manage Routes Card */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Add route</h2>
            <p>View and manage routes in the system.</p>
            <div className="card-actions justify-end">
              <Link href="/routes">
                <button className="btn btn-primary">Go to Routes</button>
              </Link>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Register worker</h2>
            <p>View and manage all locations.</p>
            <div className="card-actions justify-end">
              <Link href="/reg-w">
                <button className="btn btn-primary">Go to Registiration</button>
              </Link>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Add location</h2>
            <p>View and manage all locations.</p>
            <div className="card-actions justify-end">
              <Link href="/addplace">
                <button className="btn btn-primary">Go to places</button>
              </Link>
            </div>
          </div>
        </div>

        {/* Manage Trips Card */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Add Trips</h2>
            <p>View and manage trips in the system.</p>
            <div className="card-actions justify-end">
              <Link href="/trips">
                <button className="btn btn-primary">Go to Trips</button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
