'use client';
import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, doc, updateDoc, onSnapshot, addDoc, getDoc } from 'firebase/firestore';
import LeadActions from '../components/LeadActions';

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [agentMessage, setAgentMessage] = useState('');

  useEffect(() => {
    // Fetch bookings
    const bookingsUnsub = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      setBookings(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    // Fetch leads
    const leadsUnsub = onSnapshot(collection(db, 'leads'), (snapshot) => {
      setLeads(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    // Fetch chat sessions
    const chatUnsub = onSnapshot(collection(db, 'chat_sessions'), (snapshot) => {
      setChatSessions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => {
      bookingsUnsub();
      leadsUnsub();
      chatUnsub();
    };
  }, []);

  const assignAgent = async (sessionId) => {
    const sessionRef = doc(db, 'chat_sessions', sessionId);
    await updateDoc(sessionRef, { status: 'active', assignedAgent: 'Agent Name' }); // Replace with real agent ID/name
    setSelectedSession(sessionId);
  };

  const sendAgentMessage = async () => {
    if (!selectedSession || !agentMessage.trim()) return;
    const sessionRef = doc(db, 'chat_sessions', selectedSession);
    const sessionSnap = await getDoc(sessionRef);
    const sessionData = sessionSnap.data();
    await updateDoc(sessionRef, {
      agentMessages: [...(sessionData.agentMessages || []), { text: agentMessage, timestamp: new Date().toISOString() }],
    });
    setAgentMessage('');
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-blue-700">Admin Dashboard</h1>
        <p className="text-gray-600">Manage bookings, leads, and live chats for Genius Ventures Holdings LLC</p>
      </header>

      {/* Bookings Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">Scheduled Bookings</h2>
        {bookings.length > 0 ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Team Member</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{booking.date}</td>
                    <td className="p-4">{booking.time}</td>
                    <td className="p-4">{booking.user_name}</td>
                    <td className="p-4">{booking.user_email}</td>
                    <td className="p-4">{booking.team_member}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No bookings scheduled yet.</p>
        )}
      </section>

      {/* Leads Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">Offer Requests (Leads)</h2>
        {leads.length > 0 ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{lead.name}</td>
                    <td className="p-4">{lead.address}</td>
                    <td className="p-4">{lead.email || 'N/A'}</td>
                    <td className="p-4">{lead.phone || 'N/A'}</td>
                    <td className="p-4">{new Date(lead.timestamp).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${lead.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <LeadActions leadId={lead.id} initialStatus={lead.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No offer requests yet.</p>
        )}
      </section>

      {/* Live Chat Section */}
      <section>
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">Live Chat Sessions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-medium mb-2">Pending Chats</h3>
            {chatSessions.filter(s => s.status === 'pending').length > 0 ? (
              <ul className="space-y-2">
                {chatSessions.filter(s => s.status === 'pending').map((session) => (
                  <li key={session.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>User Chat #{session.id.slice(0, 6)}</span>
                    <button
                      onClick={() => assignAgent(session.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Take Over
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No pending chats.</p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-medium mb-2">Active Chat</h3>
            {selectedSession ? (
              <div>
                <div className="h-64 overflow-y-auto bg-gray-50 p-2 rounded border">
                  {chatSessions.find(s => s.id === selectedSession)?.userMessages?.map((msg, i) => (
                    <p key={i} className="mb-2 text-sm">{msg.text} <span className="text-xs text-gray-500">({new Date(msg.timestamp).toLocaleTimeString()})</span></p>
                  ))}
                  {chatSessions.find(s => s.id === selectedSession)?.agentMessages?.map((msg, i) => (
                    <p key={i} className="mb-2 text-sm text-right text-blue-600">{msg.text} <span className="text-xs text-gray-500">({new Date(msg.timestamp).toLocaleTimeString()})</span></p>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    value={agentMessage}
                    onChange={(e) => setAgentMessage(e.target.value)}
                    className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your reply..."
                  />
                  <button
                    onClick={sendAgentMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Select a chat to start responding.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}