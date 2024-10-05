// pages/trips.tsx
"use client"; // Ensure this page is client-rendered

import React, { useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig'; // Adjust the path based on your project structure

const TripsPage: React.FC = () => {
  useEffect(() => {
    const tripsCollection = collection(db, 'trips');
    
    // Fetch trips using onSnapshot
    const unsubscribe = onSnapshot(tripsCollection, (snapshot) => {
      const trips = snapshot.docs.map(doc => ({
        id: doc.id, // Get the document ID
        ...(doc.data()), // Get the document data
      }));

      console.log(trips); // Log trips to console
    }, (error) => {
      console.error("Error fetching trips: ", error);
    });

    // Cleanup function
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h1>Trips Page</h1>
      <p>Check the console for the fetched trips.</p>
    </div>
  );
};

export default TripsPage;
