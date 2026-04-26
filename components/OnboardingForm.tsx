'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types';

const SPORTS = [
  { id: 'padel', name: 'Padel', emoji: '🎾', desc: 'Fastest growing racket sport', color: 'from-green-500 to-emerald-600' },
  { id: 'tennis', name: 'Tennis', emoji: '🎾', desc: 'Classic racket sport', color: 'from-yellow-500 to-orange-500' },
  { id: 'basketball', name: 'Basketball', emoji: '🏀', desc: 'Court teamwork & shooting', color: 'from-orange-500 to-red-500' },
  { id: 'golf', name: 'Golf', emoji: '⛳', desc: 'Precision & course management', color: 'from-teal-500 to-green-600' },
  { id: 'squash', name: 'Squash', emoji: '🏸', desc: 'Fast-paced indoor sport', color: 'from-blue-500 to-indigo-600' },
];

const LEVELS = [
  { id: 'beginner', label: 'Complete Beginner', desc: 'Never played before', icon: '🌱' },
  { id: 'dabbled', label: 'Dabbled a Bit', desc: 'Tried it a few times', icon: '📈' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Play regularly, want to improve', icon: '🔥' },
];

const GOALS = [
  { id: 'fun', label: 'Just for Fun', emoji: '😄', desc: 'Enjoy the sport recreationally' },
  { id: 'fitness', label: 'Get Fit', emoji: '💪', desc: 'Use sport to improve fitness' },
  { id: 'competition', label: 'Compete', emoji: '🏆', desc: 'Work toward competitive play' },
];

const STEP_LABELS = ['Sport', 'Level', 'Schedule', 'Partner', 'Goal', 'About'];

export default function OnboardingForm({ sportIds }: { sportIds: Record<string, string> }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Building your plan…');
  const [error, setError] = useState('');
  const [form, setForm] = useState<Partial<UserProfile & { email: string }>>({
    days_per_week: 3,
    has_partner: false,
  });

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    const msgs = [
      'Analyzing your profile…',
      'Designing your 8-week plan…',
      'Scheduling sessions…',
      'Finding drill videos…',
      'Almost ready…',
    ];
    let i = 0;
    setLoadingMsg(msgs[0]);
    const interval = setInterval(() => {
      i = (i + 1) % msgs.length;
      setLoadingMsg(msgs[i]);
    }, 8000);

    try {
      const sportId = sportIds[form.sport?.toLowerCase() || ''];
      const payload = { ...form, sport_id: sportId, email: form.email || `guest_${Date.now()}@courtiq.app` };

      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate plan');
      clearInterval(interval);
      router.push(`/dashboard?plan_id=${data.plan_id}&user_id=${data.user_id}`);
    } catch (e) {
      clearInterval(interval);
      setError(String(e));
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-8 text-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-green-900 border-t-green-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🏆</div>
        </div>
        <div>
          <h2 className="text-2xl font-black text-white mb-2">Building your 8-week plan</h2>
          <p className="text-green-400 font-medium">{loadingMsg}</p>
          <p className="text-gray-600 text-sm mt-2">This takes about 2 minutes — hang tight</p>
        </div>
        <div className="flex gap-1.5">
          {[0,1,2,3].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEP_LABELS.map((label, i) => {
          const s = i + 1;
          return (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s < step ? 'bg-green-500 text-white' :
                  s === step ? 'bg-green-500 text-white ring-4 ring-green-500/20' :
                  'bg-white/10 text-gray-500'
                }`}>
                  {s < step ? '✓' : s}
                </div>
                <span className={`text-xs hidden sm:block ${s === step ? 'text-green-400 font-semibold' : 'text-gray-600'}`}>{label}</span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`h-px flex-1 transition-colors ${s < step ? 'bg-green-500' : 'bg-white/10'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1 — Sport */}
      {step === 1 && (
        <div>
          <h2 className="text-3xl font-black text-white mb-1">Pick your sport</h2>
          <p className="text-gray-400 mb-6">We'll build your plan around this.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SPORTS.map((sport) => (
              <button key={sport.id}
                onClick={() => { setForm({ ...form, sport: sport.name }); next(); }}
                className={`relative p-5 rounded-2xl text-left transition-all border ${
                  form.sport === sport.name
                    ? 'border-green-400 bg-green-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}>
                <div className="text-3xl mb-3">{sport.emoji}</div>
                <div className="font-bold text-white">{sport.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{sport.desc}</div>
                {form.sport === sport.name && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Level */}
      {step === 2 && (
        <div>
          <h2 className="text-3xl font-black text-white mb-1">Your current level?</h2>
          <p className="text-gray-400 mb-6">Be honest — we'll start where you are.</p>
          <div className="space-y-3">
            {LEVELS.map((level) => (
              <button key={level.id}
                onClick={() => { setForm({ ...form, fitness_level: level.id as any }); next(); }}
                className={`w-full p-5 rounded-2xl text-left border transition-all flex items-center gap-4 ${
                  form.fitness_level === level.id
                    ? 'border-green-400 bg-green-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}>
                <span className="text-3xl">{level.icon}</span>
                <div>
                  <div className="font-bold text-white">{level.label}</div>
                  <div className="text-sm text-gray-400">{level.desc}</div>
                </div>
              </button>
            ))}
          </div>
          <button onClick={back} className="mt-5 text-sm text-gray-500 hover:text-gray-300 transition-colors">← Back</button>
        </div>
      )}

      {/* Step 3 — Days per week */}
      {step === 3 && (
        <div>
          <h2 className="text-3xl font-black text-white mb-1">Training days per week?</h2>
          <p className="text-gray-400 mb-10">Consistency beats intensity every time.</p>
          <div className="flex flex-col items-center gap-6">
            <div className="text-8xl font-black text-green-400">{form.days_per_week}</div>
            <p className="text-gray-400 font-medium">days per week</p>
            <input type="range" min={1} max={6} value={form.days_per_week || 3}
              onChange={(e) => setForm({ ...form, days_per_week: parseInt(e.target.value) })}
              className="w-full max-w-sm accent-green-500 h-2" />
            <div className="flex justify-between w-full max-w-sm">
              {[1,2,3,4,5,6].map(n => (
                <span key={n} className={`text-sm font-bold ${n === form.days_per_week ? 'text-green-400' : 'text-gray-600'}`}>{n}</span>
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-10">
            <button onClick={back} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">← Back</button>
            <button onClick={next} className="bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-3 rounded-xl transition-colors">
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — Partner */}
      {step === 4 && (
        <div>
          <h2 className="text-3xl font-black text-white mb-1">Training partner?</h2>
          <p className="text-gray-400 mb-6">We'll adjust drills based on your answer.</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { val: true, label: 'Yes', emoji: '👥', desc: 'I have someone to train with' },
              { val: false, label: 'Solo', emoji: '🙋', desc: "I'll train by myself" },
            ].map(({ val, label, emoji, desc }) => (
              <button key={String(val)}
                onClick={() => { setForm({ ...form, has_partner: val }); next(); }}
                className={`p-8 rounded-2xl text-center border transition-all ${
                  form.has_partner === val
                    ? 'border-green-400 bg-green-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}>
                <div className="text-5xl mb-3">{emoji}</div>
                <div className="font-bold text-white text-lg">{label}</div>
                <div className="text-xs text-gray-400 mt-1">{desc}</div>
              </button>
            ))}
          </div>
          <button onClick={back} className="mt-5 text-sm text-gray-500 hover:text-gray-300 transition-colors">← Back</button>
        </div>
      )}

      {/* Step 5 — Goal */}
      {step === 5 && (
        <div>
          <h2 className="text-3xl font-black text-white mb-1">What's your main goal?</h2>
          <p className="text-gray-400 mb-6">This shapes the tone and intensity of your plan.</p>
          <div className="space-y-3 mb-6">
            {GOALS.map((goal) => (
              <button key={goal.id}
                onClick={() => setForm({ ...form, goal: goal.id as any })}
                className={`w-full p-5 rounded-2xl text-left border transition-all flex items-center gap-4 ${
                  form.goal === goal.id
                    ? 'border-green-400 bg-green-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}>
                <span className="text-3xl">{goal.emoji}</span>
                <div>
                  <div className="font-bold text-white">{goal.label}</div>
                  <div className="text-sm text-gray-400">{goal.desc}</div>
                </div>
                {form.goal === goal.id && (
                  <div className="ml-auto w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <button onClick={back} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">← Back</button>
            <button onClick={next} disabled={!form.goal}
              className="bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-lg px-10 py-4 rounded-2xl transition-all">
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 6 — Age */}
      {step === 6 && (
        <div>
          <h2 className="text-3xl font-black text-white mb-1">How old are you?</h2>
          <p className="text-gray-400 mb-10">We'll tailor the intensity and recovery time to your age.</p>
          <div className="flex flex-col items-center gap-6">
            <div className="text-8xl font-black text-green-400">{form.age || 25}</div>
            <p className="text-gray-400 font-medium">years old</p>
            <input type="range" min={12} max={70} value={form.age || 25}
              onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) })}
              className="w-full max-w-sm accent-green-500 h-2" />
            <div className="flex justify-between w-full max-w-sm text-sm text-gray-600 font-medium">
              <span>12</span><span>25</span><span>40</span><span>55</span><span>70</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mt-8 text-sm flex items-center justify-between">
              <span>{error.replace('Error: ', '')}</span>
              <button onClick={handleSubmit} className="ml-3 underline font-semibold flex-shrink-0">Try again</button>
            </div>
          )}

          <div className="flex justify-between items-center mt-10">
            <button onClick={back} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">← Back</button>
            <button onClick={handleSubmit}
              className="bg-green-500 hover:bg-green-400 text-white font-black text-lg px-10 py-4 rounded-2xl transition-all hover:shadow-lg hover:shadow-green-500/20">
              Build My Plan 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
