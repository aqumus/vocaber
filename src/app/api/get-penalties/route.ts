import { collection, query, getDocs, doc } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust the import path as needed
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const competitionId = searchParams.get('competitionId');
    const userName = searchParams.get('userName');

    if (!competitionId || !userName) {
      return NextResponse.json({ error: 'Competition ID and User Name are required' }, { status: 400 });
    }

    // Construct a reference to the user's penalties subcollection
    const userRef = doc(collection(db, 'competitions', competitionId, 'users'), userName);
    const penaltiesCollectionRef = collection(userRef, 'penalties');

    // Create a query to get all penalties for the user
    const q = query(penaltiesCollectionRef); // Removed the where condition for 'pending'

    const querySnapshot = await getDocs(q);

    const penalties = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(penalties);
  } catch (error: any) {
    console.error('Error fetching penalties:', error, error.stack);
    return NextResponse.json({ error: 'Error fetching penalties', details: error.message }, { status: 500 });
  }
}

// If you need to handle other HTTP methods, add them here (e.g., POST, PUT, DELETE)
// export async function POST(req: Request) { ... }