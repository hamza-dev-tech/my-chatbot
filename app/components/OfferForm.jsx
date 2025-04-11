'use client';
import { useForm } from 'react-hook-form';
import axios from 'axios';

export default function OfferForm({ onClose }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await axios.post('/api/leads', {
        name: data.name,
        address: data.address,
        email: data.email || '',
        phone: data.phone || '',
        timestamp: new Date().toISOString(),
      });
      alert('Submitted! We’ll contact you within 24 hours with your cash offer.');
      reset();
      onClose();
    } catch (error) {
      alert('Submission failed. Please try again.');
    }
  };

  return (
    <div className="mt-4 p-6 bg-white rounded-lg shadow-lg animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-blue-700">Get Your Cash Offer</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
          ✕
        </button>
      </div>
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
          <label className="block text-sm font-medium text-gray-700">Property Address *</label>
          <input
            {...register('address', { required: 'Address is required' })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="123 Main St, Miami, FL"
          />
          {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
          <input
            {...register('email')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
          <input
            {...register('phone')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="954-555-1234"
          />
        </div>
        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Request Offer
        </button>
      </form>
    </div>
  );
}