'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types';

const SPORTS = [
  { id: 'padel', name: 'Padel', emoji: '🎾', desc: 'The fastest growing racket sport' },
  { id: 'tennis', name: 'Tennis', emoji: '🎾', desc: 'Classic racket sport' },
  { id: 'basketball', name: 'Basketball', emoji: '🏀', desc: 'Court teamwork and shooting' },
  { id: 'golf', name: 'Golf', emoji: '⛳', desc: 'Precision and course management' },
  { id: 'squash', name: 'Squash', emoji: '🏸', desc: 'Fast-paced indoor racket sport' },
];

const LEVELS = [
  { id: 'beginner', label: 'Complete Beginner', desc: 'Never played before or just starting out' },
  { id: 'dabbled', label: 'Dabbled a Bit', desc: 'Tried it a few times, know the basics' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Play regularly, want to improve' },
];

const GOALS = [
  { id: 'fun', label: 'Just for Fun', emoji: '😄', desc: 'Enjoy the sport recreationally' },
  { id: 'fitness', label: 'Get Fit', emoji: '💪', desc: 'Use sport to improve overall fitness' },
  { id: 'competition', label: 'Compete', emoji: '🏆', desc: 'Work toward competitive play' },
];

export default function OnboardingForm({ sportIds }: { sportIds: Record<string, string> }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
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
    try {
      const sportId = sportIds[form.sport?.toLowerCase() || ''];
      const payload = { ...form, sport_id: sportId, email: form.email || `guest_${Date.now()}@courtiq.app` };

      let res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // retry once
        res = await fetch('/api/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate plan');
      }

      const data = await res.json();
      router.push(`/dashboard?plan_id=${data.plan_id}&user_id=${data.user_id}`);
    } catch (e) {
      setError(String(e));
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-green-200 rounded-full animate-spin border-t-green-500"></div>
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🏆</div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Building your 8-week plan…</h2>
          <p className="text-gray-500">Claude is crafting a personalized training plan just for you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex gap-1 mb-8">
        {[1,2,3,4,5].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-green-500' : 'bg-gray-200'}`} />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Which sport are you starting?</h2>
          <p className="text-gray-500 mb-6">We&apos;ll build your plan around this sport.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SPORTS.map((sport) => (
              <button
                key={sport.id}
                onClick={() => { setForm({ ...form, sport: sport.name }); next(); }}
                className={`p-4 border-2 rounded-xl text-left transition-all hover:border-green-400 hover:shadow-sm ${form.sport === sport.name ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
              >
                <div className="text-3xl mb-2">{sport.emoji}</div>
                <div className="font-semibold text-gray-900">{sport.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{sport.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">What&apos;s your current level?</h2>
          <p className="text-gray-500 mb-6">Be honest — we&apos;ll tailor the plan to where you are now.</p>
          <div className="space-y-3">
            {LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => { setForm({ ...form, fitness_level: level.id as any }); next(); }}
                className={`w-full p-4 border-2 rounded-xl text-left transition-all hover:border-green-400 ${form.fitness_level === level.id ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
              >
                <div className="font-semibold text-gray-900">{level.label}</div>
                <div className="text-sm text-gray-500">{level.desc}</div>
              </button>
            ))}
          </div>
          <button onClick={back} className="mt-4 text-sm text-gray-400 hover:text-gray-600">← Back</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How many days per week can you train?</h2>
          <p className="text-gray-500 mb-8">Be realistic — consistency beats intensity.</p>
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl font-bold text-green-500">{form.days_per_week}</div>
            <div className="text-gray-500">days per week</div>
            <input
              type="range" min={1} max={6} value={form.days_per_week || 3}
              onChange={(e) => setForm({ ...form, days_per_week: parseInt(e.target.value) })}
              className="w-full max-w-xs accent-green-500"
            />
            <div className="flex justify-between w-full max-w-xs text-xs text-gray-400">
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
            </div>
          </div>
          <div className="flex gap-3 mt-8">
            <button onClick={back} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
            <button onClick={next} className="ml-auto bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors">Continue →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Do you have a training partner?</h2>
          <p className="text-gray-500 mb-6">Some drills work better with two people.</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { val: true, label: 'Yes', emoji: '👥', desc: 'I have someone to train with' },
              { val: false, label: 'No', emoji: '🙋', desc: 'I\'ll be training solo' },
            ].map(({ val, label, emoji, desc }) => (
              <button
                key={String(val)}
                onClick={() => { setForm({ ...form, has_partner: val }); next(); }}
                className={`p-6 border-2 rounded-xl text-center transition-all hover:border-green-400 ${form.has_partner === val ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
              >
                <div className="text-4xl mb-2">{emoji}</div>
                <div className="font-semibold text-gray-900">{label}</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </button>
            ))}
          </div>
          <button onClick={back} className="mt-4 text-sm text-gray-400 hover:text-gray-600">← Back</button>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">What&apos;s your main goal?</h2>
          <p className="text-gray-500 mb-6">This shapes the tone and intensity of your plan.</p>
          <div className="space-y-3 mb-6">
            {GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setForm({ ...form, goal: goal.id as any })}
                className={`w-full p-4 border-2 rounded-xl text-left transition-all hover:border-green-400 ${form.goal === goal.id ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{goal.emoji}</span>
                  <div>
                    <div className="font-semibold text-gray-900">{goal.label}</div>
                    <div className="text-sm text-gray-500">{goal.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
              {error}
              <button onClick={handleSubmit} className="ml-2 underline">Try again</button>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={back} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
            <button
              onClick={handleSubmit}
              disabled={!form.goal}
              className="ml-auto bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Build My Plan 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
