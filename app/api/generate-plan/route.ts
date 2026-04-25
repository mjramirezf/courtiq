import { NextRequest, NextResponse } from 'next/server';
import { generatePlan } from '@/lib/claude';
import { supabaseAdmin } from '@/lib/supabase';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sport, sport_id, fitness_level, days_per_week, has_partner, goal, age, email } = body;

    const plan = await generatePlan({ sport, fitness_level, days_per_week, has_partner, goal, age });

    // Upsert user
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .upsert({ email: email || `guest_${Date.now()}@courtiq.app`, age, fitness_level, sport_id, days_per_week, goal, has_partner })
      .select()
      .single();

    if (userError) throw userError;
    const user = userData;

    // Create plan
    const { data: planData, error: planError } = await supabaseAdmin
      .from('plans')
      .insert({ user_id: user.id, sport_id, start_date: new Date().toISOString().split('T')[0], status: 'active' })
      .select()
      .single();

    if (planError) throw planError;
    const dbPlan = planData;

    // Insert weeks and sessions
    for (const week of plan.weeks) {
      const { data: weekData, error: weekError } = await supabaseAdmin
        .from('weeks')
        .insert({
          plan_id: dbPlan.id,
          week_number: week.week_number,
          phase: week.phase,
          focus: week.focus,
          milestone: week.milestone,
          coach_note: week.coach_note,
        })
        .select()
        .single();

      if (weekError) throw weekError;

      for (let i = 0; i < week.sessions.length; i++) {
        const s = week.sessions[i];
        const drillsWithVideoUrl = s.drills.map((d) => ({
          ...d,
          video_url: d.video_search_query
            ? `https://www.youtube.com/results?search_query=${encodeURIComponent(d.video_search_query)}`
            : null,
        }));

        const { error: sessionError } = await supabaseAdmin.from('sessions').insert({
          week_id: weekData.id,
          day_of_week: s.day_of_week,
          session_type: s.session_type,
          duration_minutes: s.duration_minutes,
          warm_up: s.warm_up,
          drills: drillsWithVideoUrl,
          cool_down: s.cool_down,
          session_order: i + 1,
        });

        if (sessionError) throw sessionError;
      }
    }

    return NextResponse.json({ plan_id: dbPlan.id, user_id: user.id, summary: plan.plan_summary });
  } catch (error) {
    console.error('generate-plan error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
