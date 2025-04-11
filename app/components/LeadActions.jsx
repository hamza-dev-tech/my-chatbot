'use client';
import { useState } from 'react';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function LeadActions({ leadId, initialStatus, onUpdate }) {
  const [status, setStatus] = useState(initialStatus);

  const markProcessed = async () => {
    try {
      const leadRef = doc(db, 'leads', leadId);
      await updateDoc(leadRef, { status: 'processed' });
      setStatus('processed');
      if (onUpdate) onUpdate(); // Callback to refresh data
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Failed to update status.');
    }
  };

  return (
    <div>
      {status === 'pending' ? (
        <button
          onClick={markProcessed}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition duration-200"
        >
          Mark Processed
        </button>
      ) : (
        <span className="text-green-700 text-sm">Processed</span>
      )}
    </div>
  );
}