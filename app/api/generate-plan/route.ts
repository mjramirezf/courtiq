import { NextRequest, NextResponse } from 'next/server';
import { generatePlan } from '@/lib/claude';
import { supabaseAdmin } from '@/lib/supabase';
import { searchYouTube } from '@/lib/youtube';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sport, sport_id, fitness_level, days_per_week, has_partner, goal, email } = body;
    const age = body.age || 25;

    console.log('Generating plan for:', { sport, fitness_level, days_per_week, has_partner, goal, age });

    const plan = await generatePlan({ sport, fitness_level, days_per_week, has_partner, goal, age });

    console.log('Plan generated, enriching drills with YouTube videos...');

    // Collect all drills with video_search_query across all weeks/sessions
    type DrillRef = { drill: any; weekIdx: number; sessionIdx: number; drillIdx: number };
    const drillRefs: DrillRef[] = [];
    plan.weeks.forEach((week: any, weekIdx: number) => {
      week.sessions.forEach((session: any, sessionIdx: number) => {
        session.drills.forEach((drill: any, drillIdx: number) => {
          if (drill.video_search_query) {
            drillRefs.push({ drill, weekIdx, sessionIdx, drillIdx });
          }
        });
      });
    });

    // Search YouTube for all drills in parallel
    await Promise.all(
      drillRefs.map(async ({ drill, weekIdx, sessionIdx, drillIdx }) => {
        const result = await searchYouTube(drill.video_search_query);
        const drillInPlan = plan.weeks[weekIdx].sessions[sessionIdx].drills[drillIdx];
        drillInPlan.video_url = result ? result.watchUrl : (
          drill.video_search_query
            ? `https://www.youtube.com/results?search_query=${encodeURIComponent(drill.video_search_query)}`
            : null
        );
      })
    );

    console.log('YouTube enrichment done, saving to DB...');

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .upsert({ email: email || `guest_${Date.now()}@courtiq.app`, age, fitness_level, sport_id, days_per_week, goal, has_partner })
      .select()
      .single();

    if (userError) {
      console.error('User upsert error:', userError);
      throw new Error('DB error (user): ' + JSON.stringify(userError));
    }

    const { data: planData, error: planError } = await supabaseAdmin
      .from('plans')
      .insert({ user_id: userData.id, sport_id, start_date: new Date().toISOString().split('T')[0], status: 'active' })
      .select()
      .single();

    if (planError) {
      console.error('Plan insert error:', planError);
      throw new Error('DB error (plan): ' + JSON.stringify(planError));
    }

    for (const week of plan.weeks) {
      const { data: weekData, error: weekError } = await supabaseAdmin
        .from('weeks')
        .insert({ plan_id: planData.id, week_number: week.week_number, phase: week.phase, focus: week.focus, milestone: week.milestone, coach_note: week.coach_note })
        .select()
        .single();

      if (weekError) {
        console.error('Week insert error:', weekError);
        throw new Error('DB error (week): ' + JSON.stringify(weekError));
      }

      for (let i = 0; i < week.sessions.length; i++) {
        const s = week.sessions[i];
        const drills = s.drills.map((d: any) => ({
          ...d,
          video_url: d.video_url ?? (d.video_search_query
            ? `https://www.youtube.com/results?search_query=${encodeURIComponent(d.video_search_query)}`
            : null),
        }));
        const { error: sessionError } = await supabaseAdmin.from('sessions').insert({
          week_id: weekData.id, day_of_week: s.day_of_week, session_type: s.session_type,
          duration_minutes: s.duration_minutes, warm_up: s.warm_up, drills, cool_down: s.cool_down, session_order: i + 1,
        });
        if (sessionError) {
          console.error('Session insert error:', sessionError);
          throw new Error('DB error (session): ' + JSON.stringify(sessionError));
        }
      }
    }

    console.log('Plan saved successfully:', planData.id);
    return NextResponse.json({ plan_id: planData.id, user_id: userData.id, summary: plan.plan_summary });
  } catch (error) {
    console.error('generate-plan error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
