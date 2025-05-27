import { collection, getDocs } from 'firebase/firestore';

import { NextResponse } from 'next/server';
import { db } from '../../firebase'; // Adjust the import path if needed



// Define interface for competition data fetched from Firestore
interface CompetitionData {
  name: string;
  passphrase: string; // Be cautious about exposing passphrases in a real app
  users: string[];
  // Add other fields as needed
}

export async function GET() {
  try {
    const competitionsSnapshot = await getDocs(collection(db, 'competitions'));

    const competitions: CompetitionData[] = competitionsSnapshot.docs.map(doc => ({
      id: doc.id, // Include the document ID
      ...doc.data() as CompetitionData, // Cast data to the interface
    }));

    return NextResponse.json(competitions);
  } catch (error) {
    console.error('Error fetching all competitions:', error);
    return NextResponse.json({ error: `Error fetching competitions` }, { status: 500 });
  }
}
