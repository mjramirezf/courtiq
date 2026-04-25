import { supabaseAdmin } from '@/lib/supabase';
import WeekGrid from '@/components/WeekGrid';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { plan_id?: string; user_id?: string };
}

export default async function DashboardPage({ searchParams }: Props) {
  const { plan_id, user_id } = searchParams;

  if (!plan_id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No plan found.</p>
          <Link href="/onboarding" className="bg-green-500 text-white px-6 py-2 rounded-lg">Start Onboarding</Link>
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

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Court<span className="text-green-500">IQ</span></h1>
            <p className="text-gray-500">Your 8-week {sport?.name || ''} training plan</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-500">Week {plan?.current_week || 1}</div>
            <div className="text-sm text-gray-400">of 8</div>
          </div>
        </div>

        <div className="bg-green-500 text-white rounded-2xl p-5 mb-8">
          <p className="font-semibold text-lg mb-1">Your Progress</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${((plan?.current_week || 1) / 8) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold">{completedIds.size} sessions done</span>
          </div>
        </div>

        <WeekGrid
          weeks={weeksWithSessions}
          currentWeek={plan?.current_week || 1}
          completedSessionIds={completedIds}
        />
      </div>
    </main>
  );
}
