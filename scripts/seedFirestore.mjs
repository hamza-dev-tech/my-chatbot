import { db } from '../firebase.js';
import { doc, setDoc } from 'firebase/firestore';

async function seed() {
  try {
   

// Seed availability for April 11–17, 2025
const dates = [
  '2025-04-11',
  '2025-04-12',
  '2025-04-13',
  '2025-04-14',
  '2025-04-15',
  '2025-04-16',
  '2025-04-18',
  '2025-04-19',
  '2025-04-20',
  '2025-04-21',
  '2025-04-22',
  '2025-04-23',
  '2025-04-24',
  '2025-04-25',
  '2025-04-26',
  '2025-04-27',
  '2025-04-28',
  '2025-04-29',
];
const baseSlots = [
  { time: '09:00', available: true, team_member: 'Acquisition Specialist' },
  { time: '10:00', available: true, team_member: 'Specialist' },
  { time: '11:00', available: true, team_member: 'Property Assessor' },
  { time: '14:00', available: true, team_member: 'Closing Coordinator' },
  { time: '16:00', available: true, team_member: 'Acquisition Specialist' },
];

for (const date of dates) {
  // Skip weekends (Saturday: 6, Sunday: 0)
  const day = new Date(date).getDay();
  if (day === 0 || day === 6) continue;
  await setDoc(doc(db, 'availability', date), {
    date,
    slots: baseSlots.map((slot) => ({ ...slot })), // Deep copy to avoid reference issues
  });
}


    console.log('Firestore seeded successfully with Genius Ventures Holdings LLC data');
  } catch (error) {
    console.error('Error seeding Firestore:', error);
  }
}

seed();