import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import LeadActions from '../components/LeadActions';

export default async function Dashboard() {
  const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
  const bookings = bookingsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const leadsSnapshot = await getDocs(collection(db, 'leads'));
  const leads = leadsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-blue-700">Admin Dashboard</h1>
        <p className="text-gray-600">Manage bookings and leads for Genius Ventures Holdings LLC</p>
      </header>

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
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
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

      <section>
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
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          lead.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
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
    </main>
  );
}