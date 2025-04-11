import { NextResponse } from 'next/server';
import { db } from '../../../firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  if (!date) {
    return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
  }

  try {
    const docRef = doc(db, 'availability', date);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return NextResponse.json(docSnap.data().slots);
    } else {
      return NextResponse.json([]); // Return empty array if no slots exist
    }
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json([]); // Graceful fallback
  }
}