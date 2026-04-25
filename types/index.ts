export type FitnessLevel = 'beginner' | 'dabbled' | 'intermediate';
export type Goal = 'fun' | 'competition' | 'fitness';
export type Phase = 'fundamentals' | 'skill_building' | 'match_prep';
export type SessionType = 'solo' | 'partner' | 'match' | 'rest';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type PlanStatus = 'active' | 'completed' | 'paused';

export interface Drill {
  name: string;
  reps: string;
  description: string;
  video_url: string | null;
  video_search_query?: string;
}

export interface SessionData {
  id: string;
  week_id: string;
  day_of_week: DayOfWeek;
  session_type: SessionType;
  duration_minutes: number;
  warm_up: string;
  drills: Drill[];
  cool_down: string;
  session_order: number;
}

export interface WeekData {
  id: string;
  plan_id: string;
  week_number: number;
  phase: Phase;
  focus: string;
  milestone: string;
  coach_note: string;
  sessions: SessionData[];
}

export interface PlanData {
  id: string;
  user_id: string;
  sport_id: string;
  start_date: string;
  current_week: number;
  status: PlanStatus;
  weeks: WeekData[];
}

export interface UserProfile {
  sport: string;
  sport_id?: string;
  fitness_level: FitnessLevel;
  days_per_week: number;
  has_partner: boolean;
  goal: Goal;
  age: number;
  email?: string;
}

export interface SessionLog {
  id: string;
  session_id: string;
  user_id: string;
  completed_at: string;
  rating: number;
  notes: string;
  felt_easy: boolean;
  felt_hard: boolean;
  skipped: boolean;
}
