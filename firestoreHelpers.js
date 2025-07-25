// firestoreHelpers.js
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function saveTrip(tripData) {
  try {
    await addDoc(collection(db, 'trips'), tripData);
    return true;
  } catch (error) {
    console.error('Error saving trip:', error);
    return false;
  }
} 