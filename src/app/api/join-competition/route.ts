// app/api/join-competition/route.ts
import { db } from '../../firebase'; // Adjust the import path if needed
import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, runTransaction, arrayUnion} from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { passphrase, userName } = await req.json(); // Get data from request body

    if (!passphrase || !userName) {
      return NextResponse.json({ error: 'Passphrase and user name are required' }, { status: 400 });
    }

    // Find the competition by passphrase
    const competitionsSnapshot = await getDocs(query(collection(db, 'competitions'), where('passphrase', '==', passphrase)));

    if (competitionsSnapshot.empty) {
      return NextResponse.json({ error: 'Competition not found with that passphrase' }, { status: 404 });
    }

    const competitionDoc = competitionsSnapshot.docs[0];
    const competitionId = competitionDoc.id;

    // Use a transaction to add the user to the competition and create user subdocument
    await runTransaction(db, async (transaction) => {
      // 1. Read the user document first (if it exists)
      const competitionRef = doc(db, 'competitions', competitionId);
      const userRef = doc(collection(competitionRef, 'users'), userName);
      const userDoc = await transaction.get(userRef); // Read operation
    
      // 2. Perform the write operations based on the read
      // Add user to the 'users' array in the main competition document
      transaction.update(competitionRef, {
        users: arrayUnion(userName),
      });
    
      // Only create user document if it doesn't exist
      if (!userDoc.exists()) {
        transaction.set(userRef, {
          name: userName,
          totalPenalty: 0,
        });
      }
    });


    return NextResponse.json({ id: competitionId, message: 'Joined competition successfully' });
  } catch (error: unknown) {
    console.error('Error joining competition:', error);
    return NextResponse.json({ error: `Error joining competition, ${(error as any).message}` }, { status: 500 });
  }
}
