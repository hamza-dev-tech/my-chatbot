import Chatbot from './components/Chatbot';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 text-gray-800">
      {/* Hero Section */}
      <section className="py-16 px-6 text-center bg-blue-600 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
          Genius Ventures Holdings LLC
        </h1>
        <p className="text-xl md:text-2xl mb-6 animate-fade-in-delay">
          Sell Your Home Fast. Stress Less. Get Cash Now.
        </p>
        <a
          href="#chatbot"
          className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-full shadow-lg hover:bg-blue-100 transition duration-300"
        >
          Start Chatting
        </a>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-semibold text-center mb-8 text-blue-700">
          Why Choose Us?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Fast Cash Offers', desc: 'Close in as little as 7 days.' },
            { title: 'No Repairs Needed', desc: 'We buy your home as-is.' },
            { title: 'Zero Fees', desc: 'No commissions or hidden costs.' },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <h3 className="text-xl font-medium text-blue-600 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 px-6 bg-gray-50">
        <h2 className="text-3xl font-semibold text-center mb-8 text-blue-700">
          What Our Clients Say
        </h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { name: 'Michael S', quote: 'A quick cash offer relieved a huge burden!' },
            { name: 'Sarah L', quote: 'Compassionate team, great deal on our house.' },
            { name: 'Jane D', quote: 'Closed in less than two weeks—amazing!' },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <p className="text-gray-600 italic mb-4">{item.quote}</p>
              <p className="text-sm font-medium text-blue-600">- {item.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Chatbot Section */}
      <section id="chatbot" className="py-12 px-6 max-w-2xl mx-auto">
        <Chatbot />
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 text-center bg-blue-600 text-white">
        <p>
          © 2025 Genius Ventures Holdings LLC |{' '}
          <a href="tel:954-569-5575" className="hover:underline">954-569-5575</a> |{' '}
          <a href="mailto:geniusventuresrei@gmail.com" className="hover:underline">
            geniusventuresrei@gmail.com
          </a>
        </p>
      </footer>
    </main>
  );
}