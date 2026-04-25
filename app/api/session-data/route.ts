import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });

  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: week } = await supabaseAdmin
    .from('weeks')
    .select('*')
    .eq('id', session.week_id)
    .single();

  return NextResponse.json({ session, week });
}
