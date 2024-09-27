import { doc, setDoc } from "firebase/firestore"; // Import setDoc for setting a document with a specific ID
import { db } from "@/lib/firebaseConfig";  // Adjust the import path for Firebase config
import { TripData } from './tripResponseTypes'; // Import the TripData interface

export const saveTripToFirebase = async (tripData: TripData): Promise<void> => {
  try {
    // Create a document reference with the trip ID from the backend
    const docRef = doc(db, "trips", tripData.id); // Use tripData.id as the document ID

    // Set the document with the trip data and the created timestamp
    await setDoc(docRef, {
      ...tripData,
      createdAt: new Date(), // Timestamp for when the trip was added
    });

    console.log("Trip stored in Firebase with ID: ", tripData.id);
  } catch (firebaseError) {
    // Check if the error is an instance of Error
    if (firebaseError instanceof Error) {
      console.error("Error posting trip to Firebase: ", firebaseError.message);
      throw new Error(`Failed to store trip in Firebase: ${firebaseError.message}`);
    } else {
      console.error("Unexpected error:", firebaseError);
      throw new Error("An unexpected error occurred while storing trip to Firebase.");
    }
  }
};
