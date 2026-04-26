import { supabaseAdmin } from '@/lib/supabase';
import WeekGrid from '@/components/WeekGrid';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ planId: string }>;
}

export default async function SharedPlanPage({ params }: Props) {
  const { planId } = await params;

  const { data: plan } = await supabaseAdmin
    .from('plans')
    .select('*, sports(*)')
    .eq('id', planId)
    .single();

  if (!plan) notFound();

  const { data: weeks } = await supabaseAdmin
    .from('weeks')
    .select('*')
    .eq('plan_id', planId)
    .order('week_number', { ascending: true });

  const weekIds = (weeks || []).map((w: any) => w.id);
  const { data: sessions } = weekIds.length > 0
    ? await supabaseAdmin.from('sessions').select('*').in('week_id', weekIds)
    : { data: [] };

  const weeksWithSessions = (weeks || []).map((w: any) => ({
    ...w,
    sessions: (sessions || [])
      .filter((s: any) => s.week_id === w.id)
      .sort((a: any, b: any) => a.session_order - b.session_order),
  }));

  const sport = (plan as any)?.sports;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/" className="text-2xl font-black">Court<span className="text-green-400">IQ</span></Link>
        <Link href="/onboarding" className="bg-green-500 hover:bg-green-400 text-sm font-bold px-4 py-2 rounded-lg transition-colors">
          Build My Own Plan
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-gray-900 rounded-2xl p-6 mb-8 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{sport?.name === 'Basketball' ? '🏀' : sport?.name === 'Golf' ? '⛳' : '🎾'}</span>
            <div>
              <h1 className="text-2xl font-black">8-Week {sport?.name} Plan</h1>
              <p className="text-gray-400 text-sm">Shared training plan — view only</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2 text-center">
              <div className="text-xl font-bold text-green-400">8</div>
              <div className="text-xs text-gray-400">Weeks</div>
            </div>
            <div className="bg-white/5 rounded-xl px-4 py-2 text-center">
              <div className="text-xl font-bold">{(sessions || []).length}</div>
              <div className="text-xs text-gray-400">Sessions</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4">
          <WeekGrid
            weeks={weeksWithSessions}
            currentWeek={1}
            completedSessionIds={new Set()}
          />
        </div>
      </div>
    </main>
  );
}
