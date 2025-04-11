import { NextResponse } from 'next/server';
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import axios from 'axios';

// Session memory (resets each session/server start)
let introShown = false;

export async function POST(request) {
  try {
    const { message } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        reply: "I’m your Genius Ventures assistant! Ask me anything about selling your home or setting up a quick chat. 😊",
      });
    }

    const lowerMessage = message.toLowerCase().trim();

    // Firestore content or fallback info
    const companyRef = collection(db, 'company_info');
    const snapshot = await getDocs(companyRef);
    const companyData = {};
    snapshot.forEach((doc) => {
      companyData[doc.id] = doc.data();
    });

    const context = JSON.stringify(companyData || {
      contact: {
        methods: [
          { type: 'phone', value: '954-569-5575', description: 'Call Mon-Fri, 9-5 EST' },
          { type: 'email', value: 'geniusventuresrei@gmail.com', description: 'Email anytime' },
          { type: 'form', value: 'https://geniusventuresholdings.com/', description: 'Online form' },
        ],
      },
      services: {
        offerings: [
          { name: 'Fast Cash Home Buying', description: 'Competitive cash offers, close in 7 days' },
          { name: 'As-Is Purchases', description: 'No repairs needed, we buy any condition' },
          { name: 'Creative Solutions', description: 'Help for foreclosure, probate, etc.' },
        ],
      },
      why_choose_us: {
        benefits: [
          { name: 'Speed', description: 'Quick closings, no delays' },
          { name: 'No Fees', description: 'Zero commissions or hidden costs' },
          { name: 'Ease', description: 'Sell without fixing a thing' },
        ],
      },
      faqs: {
        questions: [
          { question: 'How fast can you buy?', answer: 'As quick as 7 days!' },
        ],
      },
    });

    // 🔥 Initial Greeting Shown Before First Input
    if (!introShown) {
      introShown = true;
      return NextResponse.json({
        reply: `Hi there! 👋 I’m the official assistant for Genius Ventures Holdings LLC—your friendly neighborhood home-buying experts in South Florida.

Are you looking to:
1️⃣ Schedule a meeting or call?
2️⃣ Sell your home for cash?
3️⃣ Ask something else?

Just type a number or say what you're thinking!`,
      });
    }

    // Handle "1" or "2" as fast triggers
    if (lowerMessage === '1') {
      return NextResponse.json({
        reply: `Great! You can book your appointment here: 🗓️

What time of day works best for you—morning or afternoon?`,
        action: 'schedule',
      });
    }

    if (lowerMessage === '2') {
      return NextResponse.json({
        reply: `Let’s get you a cash offer 💰! Please fill this quick form: https://geniusventuresholdings.com/

Or just drop your name and property address right here, and we’ll get rolling!`,
        action: 'offer',
      });
    }

    // Direct message intent detection
    if (
      ['schedule', 'appointment', 'meeting', 'book', 'call'].some((word) =>
        lowerMessage.includes(word)
      )
    ) {
      return NextResponse.json({
        reply: `Sure thing! You can schedule a time with our team here: https://geniusventuresholdings.com/schedule

Let me know what works best for you.`,
        action: 'schedule',
      });
    }

    if (
      ['sell', 'selling', 'offer', 'cash', 'home', 'property', 'house'].some((word) =>
        lowerMessage.includes(word)
      )
    ) {
      return NextResponse.json({
        reply: `Sounds like you're ready to sell! 🏠 Just head over to: https://geniusventuresholdings.com/ or tell me a bit about the property (address, condition, etc.) and I’ll help from there.`,
        action: 'offer',
      });
    }

    // ✨ Gemini handles natural open chats
    const geminiResponse = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        contents: [
          {
            parts: [
              {
                text: `You’re a lively, sharp-witted AI assistant for Genius Ventures Holdings LLC, a South Florida-based powerhouse that buys homes for cash at lightning speed. Use this rich company info: ${context}, packed with details on services (fast cash offers, as-is buys, creative solutions), contact (phone: 954-569-5575, email: geniusventuresrei@gmail.com), and perks (quick closings, no fees). The user just said: "${message}". Reply in fluent, natural English only—no extra "hello" or greetings unless it fits the flow. Sound like a friendly, human teammate with a knack for humor, tossing in clever quips, playful jabs, and emojis (e.g., 🏠💸😂) to keep it fun. Keep replies concise, laser-focused, and dripping with Genius Ventures vibes—weave in prior chat context if relevant. If they veer off-topic, steer it back to home-selling with a cheeky twist that ties to our biz. When they ask questions, spice it up with a short, relevant joke tied to real estate or cash deals. Lean on the company data for meaty, specific answers, and throw in curious follow-ups (e.g., “Where’s your place?”, “What’s the home vibe?”) to spark convo. Avoid robotic vibes—make it feel like a chat with a South Florida pro who’s obsessed with turning homes into cash piles!`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
      }
    );

    let reply = geminiResponse.data.candidates[0].content.parts[0].text.trim();
    reply = reply.replace(/[*_#]+/g, ''); // clean formatting
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API Error:', error.message);
    return NextResponse.json({
      reply: `Oops! Something went wrong on my end 🛠️ but Genius Ventures is still here for you. Let’s get back on track—want to schedule something or sell your place?`,
    });
  }
}
