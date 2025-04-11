import { NextResponse } from 'next/server';
import { db } from '../../../firebase';
import { addDoc, collection, doc, updateDoc, getDoc } from 'firebase/firestore';

export async function POST(request) {
  const { date, time, user_email, user_name, team_member } = await request.json();

  if (!date || !time || !user_email || !user_name || !team_member) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Check if slot exists and is available
    const availabilityRef = doc(db, 'availability', date);
    const availabilitySnap = await getDoc(availabilityRef);
    if (!availabilitySnap.exists()) {
      return NextResponse.json({ error: 'No availability for this date' }, { status: 404 });
    }

    const slots = availabilitySnap.data().slots;
    const slotIndex = slots.findIndex((slot) => slot.time === time && slot.team_member === team_member);
    if (slotIndex === -1 || !slots[slotIndex].available) {
      return NextResponse.json({ error: 'Slot unavailable' }, { status: 400 });
    }

    // Add booking
    const bookingRef = await addDoc(collection(db, 'bookings'), {
      date,
      time,
      user_email,
      user_name,
      team_member,
      timestamp: new Date().toISOString(),
      status: 'confirmed',
    });

    // Update slot availability
    slots[slotIndex].available = false;
    await updateDoc(availabilityRef, { slots });

    return NextResponse.json({ message: 'Booking confirmed', bookingId: bookingRef.id });
  } catch (error) {
    console.error('Error booking slot:', error);
    return NextResponse.json({ error: 'Failed to schedule booking' }, { status: 500 });
  }
}