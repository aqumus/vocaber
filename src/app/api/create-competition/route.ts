import { NextResponse } from 'next/server';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust the import path if necessary

export async function POST(req: Request) {
  try {
    const { name, passphrase, userName } = await req.json();

    // 1. Create the main competition document
    const competitionRef = await addDoc(collection(db, 'competitions'), {
      name,
      passphrase,
      users: [userName],
    });

    // 2. Create a user document in the 'users' subcollection for the creator
    await setDoc(doc(collection(competitionRef, 'users'), userName), {
      name: userName,
      totalPenalty: 0,
    });

    return NextResponse.json({ id: competitionRef.id });
  } catch (error: any) {
    console.error('Error creating competition:', error, error.stack);
    return NextResponse.json({ error: 'Error creating competition' }, { status: 500 });
  }
}

// If you need to handle other HTTP methods, add them here (e.g., GET, PUT, DELETE)
// export async function GET(req: Request) { ... }