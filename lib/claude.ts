import Anthropic from '@anthropic-ai/sdk';

// Lazily initialised so the module can be imported at build time without credentials.
let _anthropic: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required. Please set it in your .env.local file.');
    }
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 4096;

export interface UserProfile {
  sport: string;
  fitness_level: string;
  days_per_week: number;
  has_partner: boolean;
  goal: string;
  age: number;
}

export interface Drill {
  name: string;
  reps: string;
  description: string;
  video_search_query?: string;
  video_url?: string | null;
}

export interface Session {
  day_of_week: string;
  session_type: string;
  duration_minutes: number;
  warm_up: string;
  drills: Drill[];
  cool_down: string;
}

export interface Week {
  week_number: number;
  phase: string;
  focus: string;
  milestone: string;
  coach_note: string;
  sessions: Session[];
}

export interface Plan {
  plan_summary: string;
  weeks: Week[];
}

export interface SessionBrief {
  greeting: string;
  todays_tip: string;
  mental_cue: string;
  what_to_notice: string;
}

async function callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }
  return content.text;
}

function parseJSON<T>(raw: string, context: string): T {
  // Strip markdown fences if present
  const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.error(`Failed to parse Claude response for ${context}:`, raw);
    throw new Error(`Claude returned invalid JSON for ${context}: ${String(e)}`);
  }
}

export async function generatePlan(userProfile: UserProfile): Promise<Plan> {
  const systemPrompt = `You are an expert sport coach specializing in beginner onboarding. Your job is to generate a complete, realistic 8-week training plan in JSON format. You must return ONLY valid JSON — no markdown, no explanation, no code fences. The plan must be achievable for someone with no prior experience. Each week should build naturally on the previous one. Include real, named drills with clear instructions. Be encouraging but realistic.`;

  const userPrompt = `Generate a complete 8-week sport onboarding plan for this athlete:
- Sport: ${userProfile.sport}
- Level: ${userProfile.fitness_level}
- Available training days per week: ${userProfile.days_per_week}
- Has training partner: ${userProfile.has_partner}
- Goal: ${userProfile.goal}
- Age: ${userProfile.age}

Return a JSON object with this exact structure:
{
  "plan_summary": "2–3 sentence overview of the plan",
  "weeks": [
    {
      "week_number": 1,
      "phase": "fundamentals",
      "focus": "Short focus title (3–5 words)",
      "milestone": "One concrete, measurable milestone for this week",
      "coach_note": "1–2 sentence motivational note from the coach",
      "sessions": [
        {
          "day_of_week": "monday",
          "session_type": "solo",
          "duration_minutes": 45,
          "warm_up": "5-minute warm-up description",
          "drills": [
            {
              "name": "Drill name",
              "reps": "3 sets of 10",
              "description": "Clear 1–2 sentence instruction",
              "video_search_query": "YouTube search query to find a good video for this drill"
            }
          ],
          "cool_down": "5-minute cool-down description"
        }
      ]
    }
  ]
}

Rules:
- Generate exactly ${userProfile.days_per_week} sessions per week (not counting rest days)
- Phase distribution: weeks 1–3 = fundamentals, weeks 4–6 = skill_building, weeks 7–8 = match_prep
- If has_partner is false, make all sessions solo-friendly (no partner required)
- Drills must have video_search_query — use specific, searchable terms like "padel forehand drill beginner slow motion"
- Make milestones concrete and checkable, e.g. "Land 7 out of 10 serves in bounds" not "improve your serve"`;

  let raw = await callClaude(systemPrompt, userPrompt);
  const plan = parseJSON<Plan>(raw, 'generatePlan');

  if (!plan.weeks || !Array.isArray(plan.weeks) || plan.weeks.length === 0) {
    throw new Error('generatePlan: Claude returned a plan with no weeks');
  }
  for (const week of plan.weeks) {
    if (!week.sessions || !Array.isArray(week.sessions)) {
      throw new Error(`generatePlan: Week ${week.week_number} has no sessions array`);
    }
  }

  return plan;
}

export async function getSessionBrief(params: {
  sport: string;
  week_number: number;
  phase: string;
  session_focus: string;
  session_type: string;
  duration_minutes: number;
  recent_logs_summary: string;
}): Promise<SessionBrief> {
  const systemPrompt = `You are a supportive sport coach giving a quick pre-session pep talk and focus tip. Return ONLY valid JSON. Be warm, specific, and brief.`;

  const userPrompt = `The athlete is about to start this session:
- Sport: ${params.sport}
- Week: ${params.week_number} of 8, Phase: ${params.phase}
- Today's focus: ${params.session_focus}
- Session type: ${params.session_type}, Duration: ${params.duration_minutes} minutes
- Their recent logs: ${params.recent_logs_summary}

Return JSON:
{
  "greeting": "One warm, personal sentence to start",
  "todays_tip": "One specific technical tip for today's main drill",
  "mental_cue": "One short phrase to remember during practice (e.g. 'Watch the ball, not the opponent')",
  "what_to_notice": "One thing to pay attention to during the session"
}`;

  const raw = await callClaude(systemPrompt, userPrompt);
  const brief = parseJSON<SessionBrief>(raw, 'getSessionBrief');

  if (!brief.greeting || !brief.todays_tip || !brief.mental_cue || !brief.what_to_notice) {
    throw new Error('getSessionBrief: Claude returned incomplete session brief');
  }

  return brief;
}

export async function adaptPlan(params: {
  logs_json: string;
  next_week: number;
  end_week: number;
  upcoming_weeks_json: string;
}): Promise<Week[]> {
  const systemPrompt = `You are a sport coach reviewing athlete progress and adjusting their upcoming training. Return ONLY valid JSON. Make adjustments based on evidence from the logs — do not change things unnecessarily.`;

  const userPrompt = `Review these recent session logs and suggest adjustments to the upcoming weeks:

Recent logs (last 3 sessions):
${params.logs_json}

Upcoming weeks (weeks ${params.next_week} to ${params.end_week}):
${params.upcoming_weeks_json}

Adjustment rules:
- If 2+ sessions were rated felt_easy=true: increase drill reps by 25% and add one harder drill per session
- If 2+ sessions were rated felt_hard=true: reduce reps by 20%, add more rest, extend phase 1 by one week
- If a session was skipped: add a catch-up note to the next session's coach_note
- If the athlete is on track: return the same weeks with a positive coach_note update only

Return the modified upcoming weeks array in the same JSON format as the input. Only return the weeks array, nothing else.`;

  const raw = await callClaude(systemPrompt, userPrompt);
  const weeks = parseJSON<Week[]>(raw, 'adaptPlan');

  if (!Array.isArray(weeks)) {
    throw new Error('adaptPlan: Claude did not return a weeks array');
  }

  return weeks;
}
