import { NextResponse } from 'next/server';
import { db } from '../../../firebase';
import { addDoc, collection } from 'firebase/firestore';

export async function POST(request) {
  const { name, address, email, phone, timestamp } = await request.json();
  if (!name || !address) {
    return NextResponse.json({ error: 'Name and address required' }, { status: 400 });
  }
  try {
    await addDoc(collection(db, 'leads'), {
      name,
      address,
      email: email || '',
      phone: phone || '',
      timestamp,
      status: 'pending',
    });
    return NextResponse.json({ message: 'Lead submitted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 });
  }
}