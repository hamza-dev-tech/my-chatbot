'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { db } from '../../firebase'; // Adjust path if needed
import { doc, onSnapshot } from 'firebase/firestore';
import MeetingScheduler from './MeetingScheduler';
import OfferForm from './OfferForm';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [teamStatus, setTeamStatus] = useState('Checking...');
  const [humanMode, setHumanMode] = useState(false);
  const [chatSessionId, setChatSessionId] = useState(null); // Store session ID
  const { register, handleSubmit, reset } = useForm();

  // Team status check
  useEffect(() => {
    const checkTeamStatus = () => {
      const now = new Date();
      const estOffset = -4 * 60; // EST offset
      const estTime = new Date(now.getTime() + estOffset * 60 * 1000);
      const hours = estTime.getUTCHours();
      const day = estTime.getUTCDay();
      const isBusinessHours = day >= 1 && day <= 5 && hours >= 9 && hours < 17;
      setTeamStatus(isBusinessHours ? 'Online' : 'Offline');
    };
    checkTeamStatus();
    const interval = setInterval(checkTeamStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // Real-time listener for agent messages
  useEffect(() => {
    let unsubChat;
    if (humanMode && chatSessionId) {
      unsubChat = onSnapshot(doc(db, 'chat_sessions', chatSessionId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.agentMessages && data.agentMessages.length > 0) {
            const newAgentMessages = data.agentMessages.map((msg) => ({
              role: 'agent',
              content: `Agent: ${msg.text}`,
            }));
            setMessages((prev) => [
              ...prev.filter((m) => m.role !== 'agent'), // Clear old agent messages to avoid duplicates
              ...newAgentMessages,
            ]);
          }
        }
      }, (error) => {
        console.error('Firestore Listener Error:', error);
      });
    }
    return () => {
      if (unsubChat) unsubChat();
    };
  }, [humanMode, chatSessionId]);

  const onSubmit = async (data) => {
    const userMessage = { role: 'user', content: data.message };
    setMessages([...messages, userMessage]);
    try {
      const response = await axios.post('/api/chat', { message: data.message });
      const botMessage = {
        role: 'bot',
        content: response.data.reply,
        action: response.data.action,
      };
      setMessages([...messages, userMessage, botMessage]);

      // Handle actions from backend
      if (botMessage.action === 'schedule') {
        setShowScheduler(true);
        setShowOfferForm(false);
        setHumanMode(false);
      } else if (botMessage.action === 'offer') {
        setShowOfferForm(true);
        setShowScheduler(false);
        setHumanMode(false);
      } else if (botMessage.action === 'human') {
        setHumanMode(true);
        setShowScheduler(false);
        setShowOfferForm(false);
        setChatSessionId(response.data.chatSessionId || chatSessionId); // Use session ID if returned
      } else {
        setShowScheduler(false);
        setShowOfferForm(false);
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages([...messages, userMessage, { role: 'bot', content: 'Oops, something glitchy happened! 😅 Try again?' }]);
    }
    reset();
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-700">Chat with Genius Ventures</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            teamStatus === 'Online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {teamStatus}
        </span>
      </div>
      <div className="h-96 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}
          >
            <div
              className={`max-w-md p-4 rounded-lg shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : msg.role === 'agent'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              {msg.content.split('\n').map((line, index) => (
                <p key={index} className="mb-2 last:mb-0 text-sm leading-relaxed">{line}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
      {showScheduler && <MeetingScheduler onClose={() => setShowScheduler(false)} />}
      {showOfferForm && <OfferForm onClose={() => setShowOfferForm(false)} />}
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3">
        <input
          {...register('message', { required: true })}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-sm"
          placeholder={humanMode ? "Waiting for a human... still wanna chat?" : "Ask about selling your home..."}
          disabled={humanMode && teamStatus !== 'Online' && !messages.some(m => m.role === 'agent')}
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-sm font-medium"
        >
          Send
        </button>
      </form>
      <div className="mt-2 text-center ">
        <button
          onClick={() => onSubmit({ message: 'talk to human' })}
          className="text-white hover:underline text-sm bg-gray-400 rounded-lg px-4 py-2 mt-2 cursor-pointer"
          disabled={teamStatus !== 'Online' || humanMode}
        >
          Talk to a Human
        </button>
      </div>
      <div className="mt-2 text-center text-gray-500 text-xs">
        <p>87 Satisfied Clients | 150 Homes Purchased</p>
      </div>
    </div>
  );
}