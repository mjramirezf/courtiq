import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { session_id, user_id, rating, notes, felt_easy, felt_hard, skipped } = await req.json();

    const { data: log, error: logError } = await supabaseAdmin
      .from('session_logs')
      .insert({ session_id, user_id, rating, notes, felt_easy, felt_hard, skipped: skipped || false })
      .select()
      .single();

    if (logError) throw logError;

    // Trigger adapt-plan if significant feedback
    if (felt_easy || felt_hard) {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/adapt-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id }),
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, log_id: log.id });
  } catch (error) {
    console.error('log-session error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
