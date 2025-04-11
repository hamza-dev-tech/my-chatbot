'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useForm } from 'react-hook-form';

export default function MeetingScheduler({ onClose }) {
  const [date, setDate] = useState(new Date());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingStatus, setBookingStatus] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchSlots(date);
  }, [date]);

  const fetchSlots = async (selectedDate) => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    try {
      const response = await axios.get(`/api/availability?date=${formattedDate}`);
      setSlots(response.data);
      setSelectedSlot(null);
      setBookingStatus('');
    } catch (error) {
      setSlots([]);
      setBookingStatus('Unable to load slots. Call us at 954-569-5575.');
    }
  };

  const onSubmit = async (data) => {
    if (!selectedSlot) {
      setBookingStatus('Please select a time slot.');
      return;
    }
    const formattedDate = date.toISOString().split('T')[0];
    try {
      await axios.post('/api/book', {
        date: formattedDate,
        time: selectedSlot,
        user_email: data.email,
        user_name: data.name,
        team_member: slots.find((slot) => slot.time === selectedSlot).team_member,
      });
      setBookingStatus(`Call scheduled for ${formattedDate} at ${selectedSlot}! Check your email: ${data.email}.`);
      reset();
      setSelectedSlot(null);
      fetchSlots(date);
      setTimeout(onClose, 3000);
    } catch (error) {
      setBookingStatus('Booking failed. Try again or call 954-569-5575.');
    }
  };

  const tileDisabled = ({ date }) => date.getDay() === 0 || date.getDay() === 6;

  return (
    <div className="mt-4 p-6 bg-white rounded-lg shadow-lg animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-blue-700">Schedule Your Call</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
          ✕
        </button>
      </div>
      <Calendar
        onChange={setDate}
        value={date}
        minDate={new Date()}
        tileDisabled={tileDisabled}
        className="mb-6 border-none rounded-lg shadow-sm"
      />
      {slots.length > 0 ? (
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-700 mb-3">Available Slots (EST)</h4>
          <div className="grid grid-cols-2 gap-3">
            {slots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => setSelectedSlot(slot.time)}
                disabled={!slot.available}
                className={`p-3 rounded-lg text-sm font-medium transition duration-200 ${
                  selectedSlot === slot.time
                    ? 'bg-blue-600 text-white'
                    : slot.available
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {slot.time} - {slot.team_member}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="mb-6 text-gray-600">No slots available for {date.toDateString()}. Try a weekday.</p>
      )}
      {selectedSlot && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Your Name *</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Your Email *</label>
            <input
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Book Now
          </button>
        </form>
      )}
      {bookingStatus && (
        <p
          className={`mt-4 text-sm font-medium ${
            bookingStatus.includes('scheduled') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {bookingStatus}
        </p>
      )}
    </div>
  );
}