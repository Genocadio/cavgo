"use client"; // Ensure this page is treated as a client component

import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig'; // Adjust this path based on your project structure
import { useAppSelector } from '@/lib/hooks'; // Custom hook for Redux store access
import { toast } from 'react-toastify'; // Import toast from react-toastify

// Define TypeScript types
interface Trip {
  route: {
    origin: { name: string };
    destination: { name: string };
    price: number;
    stopPoints?: Array<{ location: { name: string }; price: number }>;
  };
  availableSeats: number;
  boardingTime: number;
}

interface BookTripProps {
  params: { id: string };
}

const BookTrip: React.FC<BookTripProps> = ({ params }) => {
  const { id } = params; // Get the trip ID directly from params
  const [trip, setTrip] = useState<Trip | null>(null);
  const [numberOfTickets, setNumberOfTickets] = useState<number>(1);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const destination = useAppSelector(state => state.locations.destination); // Access destination from Redux store

  useEffect(() => {
    const fetchTripDetails = async () => {
      if (id) {
        const tripDoc = doc(db, 'trips', id); // Get the trip document
        const tripSnapshot = await getDoc(tripDoc);
        if (tripSnapshot.exists()) {
          setTrip(tripSnapshot.data() as Trip);
        } else {
          console.error("No such trip!");
        }
      }
    };

    fetchTripDetails();
  }, [id]);

  useEffect(() => {
    if (trip && destination) {
      let price = trip.route.price; // Default to route price

      // Check if the destination is a stop point
      const stopPoint = trip.route.stopPoints?.find(sp => sp.location.name === destination.name);
      if (stopPoint) {
        price = stopPoint.price; // Use stop point price if available
      }

      setTotalPrice(price * numberOfTickets);
    }
  }, [trip, destination, numberOfTickets]);

  const handleTicketChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    // Allow deleting the input or set number of tickets to a valid number
    if (trip && trip.availableSeats) {
      if (e.target.value === "" || (value <= trip.availableSeats && value > 0)) {
        setNumberOfTickets(value);
      }
    }
  };

  const handleBooking = async () => {
    if (trip) {
      // Check if enough seats are available
      if (numberOfTickets > trip.availableSeats) {
        toast.error("Not enough available seats."); // Use toast notification
        return;
      }

      // Deduct the number of tickets from available seats
      const updatedSeats = trip.availableSeats - numberOfTickets;

      // Update the trip document in Firestore
      const tripDoc = doc(db, 'trips', id);
      await updateDoc(tripDoc, { availableSeats: updatedSeats });

      // Update local state
      setTrip(prev => prev ? { ...prev, availableSeats: updatedSeats } : null);
      toast.success("Booking confirmed!"); // Use toast notification
    }
  };

  if (!trip) {
    return <p>Loading trip details...</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="text-2xl font-semibold text-center">
            Book Trip: {trip.route.origin.name} to {trip.route.destination.name}
          </h2>
          <p className="text-center">Available Seats: {trip.availableSeats}</p>
          <p className="text-center">Price per Ticket: ${trip.route.price}</p>
          <p className="text-center">Boarding Time: {new Date(Number(trip.boardingTime)).toLocaleString()}</p>

          <div className="form-control">
            <label htmlFor="ticket-count" className="label">
              <span className="label-text">Number of Tickets:</span>
            </label>
            <input
              type="number"
              id="ticket-count"
              value={numberOfTickets}
              onChange={handleTicketChange}
              min="1"
              max={trip.availableSeats}
              placeholder="Enter number of tickets"
              className="input input-bordered w-full"
            />
          </div>

          <h3 className="text-xl font-semibold text-center mt-4">Total Price: {totalPrice} Rwf</h3>
          <button 
            onClick={handleBooking} 
            className="btn btn-primary w-full mt-4"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookTrip;
