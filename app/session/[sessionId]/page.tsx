'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import CoachMessage from '@/components/CoachMessage';
import DrillItem from '@/components/DrillItem';
import { SessionBrief } from '@/lib/claude';
import { Drill } from '@/types';

export default function SessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const userId = searchParams.get('user_id') || '';

  const [session, setSession] = useState<any>(null);
  const [week, setWeek] = useState<any>(null);
  const [brief, setBrief] = useState<SessionBrief | null>(null);
  const [briefLoading, setBriefLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [feltEasy, setFeltEasy] = useState(false);
  const [feltHard, setFeltHard] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      const res = await fetch(`/api/session-data?session_id=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
        setWeek(data.week);
      }
      setLoading(false);
    }
    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    if (!session) return;
    async function fetchBrief() {
      setBriefLoading(true);
      const res = await fetch('/api/session-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, user_id: userId }),
      });
      if (res.ok) setBrief(await res.json());
      setBriefLoading(false);
    }
    fetchBrief();
  }, [session, sessionId, userId]);

  const handleComplete = async () => {
    setSubmitting(true);
    await fetch('/api/log-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, user_id: userId, rating, notes, felt_easy: feltEasy, felt_hard: feltHard }),
    });
    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => router.back(), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-200 rounded-full animate-spin border-t-green-500" />
      </div>
    );
  }

  if (!session) return <div className="min-h-screen flex items-center justify-center text-gray-500">Session not found.</div>;

  const drills: Drill[] = session.drills || [];

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1">
          ← Back to plan
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-gray-500 uppercase">{session.day_of_week}</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{session.session_type}</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">{week?.focus || 'Training Session'}</h1>
          <p className="text-gray-500">{session.duration_minutes} minutes · {drills.length} drills</p>
        </div>

        {briefLoading ? (
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 mb-6 animate-pulse">
            <div className="h-4 bg-white/20 rounded w-3/4 mb-3" />
            <div className="h-4 bg-white/20 rounded w-1/2" />
          </div>
        ) : brief ? (
          <div className="mb-6"><CoachMessage {...brief} /></div>
        ) : null}

        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-2">Warm Up</h2>
          <p className="text-gray-600">{session.warm_up}</p>
        </div>

        <div className="mb-4">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3">Drills</h2>
          <div className="space-y-3">
            {drills.map((drill, i) => <DrillItem key={i} drill={drill} index={i} />)}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-8">
          <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-2">Cool Down</h2>
          <p className="text-gray-600">{session.cool_down}</p>
        </div>

        {submitted ? (
          <div className="bg-green-50 border border-green-300 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="font-bold text-green-700">Session logged! Great work.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-4">Log This Session</h2>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">How did it go? (1–5)</p>
              <div className="flex gap-2">
                {[1,2,3,4,5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    className={`w-10 h-10 rounded-full border-2 font-bold transition-all ${rating >= n ? 'bg-yellow-400 border-yellow-400 text-white' : 'border-gray-200 text-gray-400'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setFeltEasy(!feltEasy)}
                className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${feltEasy ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-gray-200 text-gray-500'}`}
              >
                😎 Too Easy
              </button>
              <button
                onClick={() => setFeltHard(!feltHard)}
                className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${feltHard ? 'bg-red-50 border-red-400 text-red-700' : 'border-gray-200 text-gray-500'}`}
              >
                😤 Very Hard
              </button>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)…"
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:border-green-400"
            />

            <button
              onClick={handleComplete}
              disabled={submitting || rating === 0}
              className="w-full mt-4 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {submitting ? 'Saving…' : 'Complete Session ✓'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
