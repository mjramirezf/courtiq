import { supabaseAdmin } from '@/lib/supabase';
import WeekGrid from '@/components/WeekGrid';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ plan_id?: string; user_id?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const { plan_id, user_id } = await searchParams;

  if (!plan_id) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No plan found.</p>
          <Link href="/onboarding" className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-xl transition-colors">
            Start Onboarding
          </Link>
        </div>
      </div>
    );
  }

  const { data: plan } = await supabaseAdmin
    .from('plans')
    .select('*, sports(*)')
    .eq('id', plan_id)
    .single();

  const { data: weeks } = await supabaseAdmin
    .from('weeks')
    .select('*')
    .eq('plan_id', plan_id)
    .order('week_number', { ascending: true });

  const weekIds = (weeks || []).map((w: any) => w.id);
  const { data: sessions } = weekIds.length > 0
    ? await supabaseAdmin.from('sessions').select('*').in('week_id', weekIds)
    : { data: [] };

  const { data: logs } = user_id
    ? await supabaseAdmin.from('session_logs').select('session_id').eq('user_id', user_id)
    : { data: [] };

  const completedIds = new Set((logs || []).map((l: any) => l.session_id));

  const weeksWithSessions = (weeks || []).map((w: any) => ({
    ...w,
    sessions: (sessions || []).filter((s: any) => s.week_id === w.id).sort((a: any, b: any) => a.session_order - b.session_order),
  }));

  const sport = (plan as any)?.sports;
  const currentWeek = plan?.current_week || 1;
  const totalSessions = (sessions || []).length;
  const completedCount = completedIds.size;
  const completePct = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

  // Find first incomplete session in current week for "Start Next Session" button
  const currentWeekData = weeksWithSessions.find((w: any) => w.week_number === currentWeek);
  const nextSession = currentWeekData?.sessions?.find((s: any) => !completedIds.has(s.id))
    ?? weeksWithSessions.flatMap((w: any) => w.sessions).find((s: any) => !completedIds.has(s.id));

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Dark header */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/" className="text-2xl font-black">Court<span className="text-green-400">IQ</span></Link>
        <div className="text-right">
          <div className="text-sm text-gray-400">8-Week {sport?.name || ''} Plan</div>
          <div className="text-xs text-gray-600">Plan ID: {plan_id.slice(0, 8)}…</div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 text-center">
            <div className="text-3xl font-black text-green-400">Week {currentWeek}/8</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide font-semibold">Current Week</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <div className="text-3xl font-black text-white">{completedCount}/{totalSessions}</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide font-semibold">Sessions Done</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <div className="text-3xl font-black text-white">{completePct}%</div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wide font-semibold">Complete</div>
          </div>
        </div>

        {/* Progress bar + CTA */}
        <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 mb-8 flex items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-300">Overall Progress</span>
              <span className="text-sm text-gray-500">{completedCount} of {totalSessions} sessions</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5">
              <div
                className="bg-green-500 rounded-full h-2.5 transition-all"
                style={{ width: `${completePct}%` }}
              />
            </div>
          </div>
          {nextSession && (
            <Link
              href={`/session/${nextSession.id}?plan_id=${plan_id}&user_id=${user_id || ''}`}
              className="flex-shrink-0 bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
            >
              Start Next Session →
            </Link>
          )}
        </div>

        {/* Week Grid on white card */}
        <div className="bg-white rounded-2xl p-4">
          <WeekGrid
            weeks={weeksWithSessions}
            currentWeek={currentWeek}
            completedSessionIds={completedIds}
          />
        </div>
      </div>
    </main>
  );
}
