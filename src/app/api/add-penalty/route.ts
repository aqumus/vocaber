import { NextRequest, NextResponse } from 'next/server';
import { collection, doc, runTransaction } from 'firebase/firestore';
import { db } from '../../firebase'; // Assuming your firebase.ts is in src/app/

export async function POST(req: NextRequest) {
  try {
    const { competitionId, penalizedUser, penalizingUser, reason, amount } = await req.json();

    if (!competitionId || !penalizedUser || !penalizingUser || reason === undefined || amount === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const competitionRef = doc(db, 'competitions', competitionId);
    const penalizedUserRef = doc(collection(competitionRef, 'users'), penalizedUser);

    await runTransaction(db, async (transaction) => {
      const penalizedUserDoc = await transaction.get(penalizedUserRef);

      if (!penalizedUserDoc.exists()) {
        throw new Error("Penalized user does not exist in this competition.");
      }

      const userData = penalizedUserDoc.data();
      // const currentTotalPenalty = userData.totalPenalty || 0;
      // const newTotalPenalty = currentTotalPenalty + amount;

      // // Update the penalized user's total penalty
      // transaction.update(penalizedUserRef, {
      //   totalPenalty: newTotalPenalty,
      // });

      // Optional: Add penalty details as a subcollection if needed
      const penaltiesCollectionRef = collection(penalizedUserRef, 'penalties');
      transaction.set(doc(penaltiesCollectionRef), {
        competitionId,
        penalizingUser,
        reason: reason,
        amount: amount,
        status: 'pending',
        timestamp: new Date(), // Add a timestamp
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error adding penalty:', error);
    return NextResponse.json({ error: 'Error adding penalty' }, { status: 500 });
  }
}