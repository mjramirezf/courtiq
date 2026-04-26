import Link from 'next/link';

const sports = [
  { name: 'Padel', emoji: '🎾', color: 'from-green-400 to-emerald-500' },
  { name: 'Tennis', emoji: '🎾', color: 'from-yellow-400 to-orange-400' },
  { name: 'Basketball', emoji: '🏀', color: 'from-orange-400 to-red-400' },
  { name: 'Golf', emoji: '⛳', color: 'from-teal-400 to-green-500' },
  { name: 'Squash', emoji: '🏸', color: 'from-blue-400 to-indigo-500' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <span className="text-2xl font-black">Court<span className="text-green-400">IQ</span></span>
        <Link href="/onboarding" className="bg-green-500 hover:bg-green-400 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">
          Get Started
        </Link>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold px-4 py-2 rounded-full mb-8">
          🏆 AI-Powered Sport Coaching
        </div>
        <h1 className="text-6xl sm:text-7xl font-black mb-6 leading-tight">
          Train smarter.<br />
          <span className="text-green-400">Progress faster.</span>
        </h1>
        <p className="text-xl text-gray-400 mb-4 max-w-2xl mx-auto">
          Answer 5 questions. Get a personalized 8-week training plan — built by Claude AI, adapted to your progress.
        </p>
        <p className="text-gray-500 mb-10">Real drills. Real videos. Real results.</p>
        <Link href="/onboarding"
          className="inline-block bg-green-500 hover:bg-green-400 text-white font-bold text-lg px-12 py-5 rounded-2xl shadow-lg shadow-green-500/20 transition-all hover:shadow-green-500/40 hover:-translate-y-0.5">
          Build My Plan →
        </Link>
      </div>

      {/* Sports */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <p className="text-center text-gray-500 text-sm mb-6 uppercase tracking-widest font-semibold">Available sports</p>
        <div className="flex flex-wrap justify-center gap-3">
          {sports.map((s) => (
            <div key={s.name} className={`bg-gradient-to-br ${s.color} p-px rounded-2xl`}>
              <div className="bg-gray-950 rounded-2xl px-5 py-3 flex items-center gap-2">
                <span className="text-xl">{s.emoji}</span>
                <span className="font-semibold text-white">{s.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="border-t border-white/5 bg-gray-900/50">
        <div className="max-w-5xl mx-auto px-6 py-20 grid sm:grid-cols-3 gap-8">
          {[
            { icon: '🎯', title: 'Personalized', desc: 'Built for your level, schedule, and goals — not a generic plan.' },
            { icon: '📈', title: 'Adaptive', desc: 'Claude adjusts upcoming weeks based on how your sessions actually go.' },
            { icon: '🎥', title: 'Video Drills', desc: 'Every drill links to a real YouTube tutorial so you know exactly what to do.' },
          ].map((f) => (
            <div key={f.title} className="text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="text-center py-8 text-gray-600 text-sm border-t border-white/5">
        CourtIQ — Powered by Claude AI
      </footer>
    </main>
  );
}
