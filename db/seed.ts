import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const sports = [
  {
    name: 'Padel',
    total_weeks: 8,
    default_sessions_per_week: 3,
    equipment_needed: ['padel racket', 'padel balls', 'court shoes'],
    phase_names: ['Court awareness', 'Shot consistency', 'Match play'],
  },
  {
    name: 'Tennis',
    total_weeks: 8,
    default_sessions_per_week: 3,
    equipment_needed: ['tennis racket', 'tennis balls', 'court shoes'],
    phase_names: ['Groundstroke basics', 'Serve and return', 'Match tactics'],
  },
  {
    name: 'Basketball',
    total_weeks: 8,
    default_sessions_per_week: 3,
    equipment_needed: ['basketball', 'court shoes'],
    phase_names: ['Ball handling', 'Shooting form', 'Game situations'],
  },
  {
    name: 'Golf',
    total_weeks: 8,
    default_sessions_per_week: 3,
    equipment_needed: ['golf clubs', 'golf balls', 'golf shoes', 'range membership'],
    phase_names: ['Swing fundamentals', 'Course management', 'Short game'],
  },
  {
    name: 'Squash',
    total_weeks: 8,
    default_sessions_per_week: 3,
    equipment_needed: ['squash racket', 'squash balls', 'court shoes', 'eye protection'],
    phase_names: ['Court movement', 'Shot accuracy', 'Match strategy'],
  },
];

async function seed() {
  console.log('Seeding sports…');
  const { error } = await supabase.from('sports').upsert(sports, { onConflict: 'name' });
  if (error) {
    console.error('Error seeding sports:', error);
    process.exit(1);
  }
  console.log('Done! Seeded', sports.length, 'sports.');
}

seed();
