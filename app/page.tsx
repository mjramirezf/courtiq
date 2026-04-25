import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <span>🏆</span> AI-Powered Sport Coaching
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-gray-900 mb-4 tracking-tight">
            Court<span className="text-green-500">IQ</span>
          </h1>
          <p className="text-xl text-gray-600 mb-2 max-w-2xl mx-auto">
            Get a personalized 8-week training plan for any sport — powered by Claude AI.
          </p>
          <p className="text-gray-400 mb-10">Answer 5 questions. Get a complete plan. Start training today.</p>
          <Link
            href="/onboarding"
            className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            Start My Journey →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
          {[
            { emoji: '🎯', title: 'Personalized', desc: 'Every plan is built for your skill level, schedule, and goals' },
            { emoji: '📈', title: 'Adaptive', desc: 'Claude adjusts your upcoming weeks based on how sessions go' },
            { emoji: '🎥', title: 'Drill Videos', desc: 'Every drill links to a YouTube search so you can see exactly how it\'s done' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="text-4xl mb-3">{f.emoji}</div>
              <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <p className="text-sm text-gray-400 mb-4">Supported sports</p>
          <div className="flex justify-center gap-8 text-gray-600">
            {['🎾 Padel', '🎾 Tennis', '🏀 Basketball', '⛳ Golf', '🏸 Squash'].map((s) => (
              <span key={s} className="text-sm font-medium">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
