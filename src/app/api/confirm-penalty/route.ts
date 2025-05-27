import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../firebase'; // Adjust the import path as necessary
import { doc, runTransaction } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { competitionId, penalizedUser, penaltyId, amount } = await req.json();

    if (!competitionId || !penalizedUser || !penaltyId || amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const competitionRef = doc(db, 'competitions', competitionId);
    const userRef = doc(competitionRef, 'users', penalizedUser);
    const penaltyRef = doc(userRef, 'penalties', penaltyId);

    // Use a transaction to ensure atomicity when updating totalPenalty
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const penaltyDoc = await transaction.get(penaltyRef);

      if (!userDoc.exists()) {
        throw new Error('User document does not exist');
      }

      if (!penaltyDoc.exists()) {
        throw new Error('Penalty document does not exist');
      }

      if(penaltyDoc.data().status === 'confirmed') {
        return NextResponse.json({ success: true, details: "Penalty already confirmed" });
      }

      const currentTotalPenalty = userDoc.data().totalPenalty || 0;
      const penaltyAmount = penaltyDoc.data().amount || 0;

      // Update the user's total penalty
      transaction.update(userRef, {
        totalPenalty: currentTotalPenalty + penaltyAmount,
      });

      // Mark the pending penalty document as confirmed instead of deleting
      transaction.update(penaltyRef, {
        status: 'confirmed',
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error confirming penalty:', error);
    return NextResponse.json({ error: `Error confirming penalty ${error.message}` }, { status: 500 });
  }
}

// Optional: Handle other HTTP methods if needed
export async function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}