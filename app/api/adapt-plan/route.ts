import { NextRequest, NextResponse } from 'next/server';
import { adaptPlan } from '@/lib/claude';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json();

    const { data: logs } = await supabaseAdmin
      .from('session_logs')
      .select('*')
      .eq('user_id', user_id)
      .order('completed_at', { ascending: false })
      .limit(3);

    if (!logs || logs.length === 0) return NextResponse.json({ message: 'No logs to adapt from' });

    const { data: plan } = await supabaseAdmin
      .from('plans')
      .select('*, weeks(*)')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .single();

    if (!plan) return NextResponse.json({ message: 'No active plan found' });

    const currentWeek = plan.current_week || 1;
    const upcomingWeeks = (plan as any).weeks
      .filter((w: any) => w.week_number > currentWeek)
      .slice(0, 2)
      .sort((a: any, b: any) => a.week_number - b.week_number);

    if (upcomingWeeks.length === 0) return NextResponse.json({ message: 'No upcoming weeks to adapt' });

    // Fetch sessions for upcoming weeks
    const weekIds = upcomingWeeks.map((w: any) => w.id);
    const { data: sessions } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .in('week_id', weekIds);

    const weeksWithSessions = upcomingWeeks.map((w: any) => ({
      ...w,
      sessions: sessions?.filter((s: any) => s.week_id === w.id) || [],
    }));

    const adaptedWeeks = await adaptPlan({
      logs_json: JSON.stringify(logs),
      next_week: upcomingWeeks[0].week_number,
      end_week: upcomingWeeks[upcomingWeeks.length - 1].week_number,
      upcoming_weeks_json: JSON.stringify(weeksWithSessions),
    });

    // Update weeks in DB
    for (const adaptedWeek of adaptedWeeks) {
      const dbWeek = upcomingWeeks.find((w: any) => w.week_number === adaptedWeek.week_number);
      if (!dbWeek) continue;

      await supabaseAdmin
        .from('weeks')
        .update({ focus: adaptedWeek.focus, milestone: adaptedWeek.milestone, coach_note: adaptedWeek.coach_note })
        .eq('id', dbWeek.id);

      if (adaptedWeek.sessions) {
        for (const s of adaptedWeek.sessions) {
          const dbSession = sessions?.find((ds: any) => ds.week_id === dbWeek.id && ds.day_of_week === s.day_of_week);
          if (dbSession) {
            await supabaseAdmin
              .from('sessions')
              .update({ drills: s.drills, warm_up: s.warm_up, cool_down: s.cool_down, duration_minutes: s.duration_minutes })
              .eq('id', dbSession.id);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('adapt-plan error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
