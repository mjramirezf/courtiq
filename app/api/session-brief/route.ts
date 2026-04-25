import { NextRequest, NextResponse } from 'next/server';
import { getSessionBrief } from '@/lib/claude';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { session_id, user_id } = await req.json();

    const { data: session } = await supabaseAdmin
      .from('sessions')
      .select('*, weeks(*, plans(*, sports(*)))')
      .eq('id', session_id)
      .single();

    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const { data: logs } = await supabaseAdmin
      .from('session_logs')
      .select('*')
      .eq('user_id', user_id)
      .order('completed_at', { ascending: false })
      .limit(3);

    const recentLogsSummary = logs && logs.length > 0
      ? logs.map((l: any) => `Rating: ${l.rating}/5, felt_easy: ${l.felt_easy}, felt_hard: ${l.felt_hard}, skipped: ${l.skipped}, notes: "${l.notes || 'none'}"`).join('; ')
      : 'No previous sessions logged yet';

    const week = (session as any).weeks;
    const plan = week?.plans;
    const sport = plan?.sports;

    const brief = await getSessionBrief({
      sport: sport?.name || 'sport',
      week_number: week?.week_number || 1,
      phase: week?.phase || 'fundamentals',
      session_focus: week?.focus || '',
      session_type: session.session_type || 'solo',
      duration_minutes: session.duration_minutes || 45,
      recent_logs_summary: recentLogsSummary,
    });

    return NextResponse.json(brief);
  } catch (error) {
    console.error('session-brief error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
