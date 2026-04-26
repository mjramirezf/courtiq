'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import CoachMessage from '@/components/CoachMessage';
import DrillItem from '@/components/DrillItem';
import { SessionBrief } from '@/lib/claude';
import { Drill } from '@/types';
import Link from 'next/link';

const sessionTypeColors: Record<string, string> = {
  solo: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  partner: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  match: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  rest: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

export default function SessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const userId = searchParams.get('user_id') || '';
  const planId = searchParams.get('plan_id') || '';

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
    setTimeout(() => router.push(`/dashboard?plan_id=${planId}&user_id=${userId}`), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-900 rounded-full animate-spin border-t-green-500" />
      </div>
    );
  }

  if (!session) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-500">Session not found.</div>
  );

  const drills: Drill[] = session.drills || [];

  return (
    <main className="min-h-screen bg-gray-950 text-white pb-16">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10 mb-6">
        <Link href={`/dashboard?plan_id=${planId}&user_id=${userId}`} className="text-2xl font-black">
          Court<span className="text-green-400">IQ</span>
        </Link>
        <button onClick={() => router.push(`/dashboard?plan_id=${planId}&user_id=${userId}`)}
          className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
          ← Back to plan
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-4">
        {/* Session header */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{session.day_of_week}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${sessionTypeColors[session.session_type] || sessionTypeColors.solo}`}>
              {session.session_type}
            </span>
            <span className="text-xs text-gray-500">Week {week?.week_number}</span>
          </div>
          <h1 className="text-2xl font-black mb-1">{week?.focus || 'Training Session'}</h1>
          <p className="text-gray-400">{session.duration_minutes} min · {drills.length} drills</p>
        </div>

        {/* Coach brief */}
        {briefLoading ? (
          <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border border-green-500/20 rounded-2xl p-6 mb-6 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
            <div className="h-4 bg-white/10 rounded w-1/2" />
          </div>
        ) : brief ? (
          <div className="mb-6"><CoachMessage {...brief} /></div>
        ) : null}

        {/* Warm up */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 mb-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Warm Up</h2>
          <p className="text-gray-300">{session.warm_up}</p>
        </div>

        {/* Drills */}
        <div className="mb-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Drills</h2>
          <div className="space-y-4">
            {drills.map((drill, i) => <DrillItem key={i} drill={drill} index={i} />)}
          </div>
        </div>

        {/* Cool down */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 mb-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Cool Down</h2>
          <p className="text-gray-300">{session.cool_down}</p>
        </div>

        {/* Log form */}
        {submitted ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-bold text-green-400 text-lg">Session logged! Great work.</p>
            <p className="text-gray-400 text-sm mt-1">Heading back to your plan…</p>
          </div>
        ) : (
          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
            <h2 className="font-bold text-white text-lg mb-5">Log This Session</h2>

            <div className="mb-5">
              <p className="text-sm font-medium text-gray-400 mb-3">How did it go?</p>
              <div className="flex gap-2">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} onClick={() => setRating(n)}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${rating >= n ? 'bg-yellow-400 text-gray-900' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}>
                    {['😫','😕','😐','😊','🔥'][n-1]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mb-5">
              <button onClick={() => setFeltEasy(!feltEasy)}
                className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${feltEasy ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                😎 Too Easy
              </button>
              <button onClick={() => setFeltHard(!feltHard)}
                className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${feltHard ? 'bg-red-500/20 border-red-500/50 text-red-300' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                😤 Very Hard
              </button>
            </div>

            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)…"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:border-green-500 text-white placeholder-gray-600" />

            <button onClick={handleComplete} disabled={submitting || rating === 0}
              className="w-full mt-4 bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors text-lg">
              {submitting ? 'Saving…' : 'Complete Session ✓'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
