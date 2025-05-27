import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust the import path as needed

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const competitionId = url.searchParams.get('competitionId');

    if (!competitionId) {
      return NextResponse.json({ error: 'Competition ID is required' }, { status: 400 });
    }

    const competitionRef = doc(db, 'competitions', competitionId);
    const competitionDoc = await getDoc(competitionRef);

    if (!competitionDoc.exists()) {
      return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
    }

    const competitionData = competitionDoc.data();

    // Fetch users subcollection
    const usersCollectionRef = collection(competitionRef, 'users');
    const usersSnapshot = await getDocs(usersCollectionRef);
    const usersData = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      id: competitionDoc.id,
      ...competitionData,
      users: usersData
    });

  } catch (error: any) {
    console.error('Error fetching competition details:', error, error.stack);
    return NextResponse.json({ error: 'Error fetching competition details' }, { status: 500 });
  }
}