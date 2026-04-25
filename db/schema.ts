import { pgTable, uuid, text, integer, boolean, timestamp, date, jsonb } from 'drizzle-orm/pg-core';

export const sports = pgTable('sports', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  total_weeks: integer('total_weeks').default(8),
  default_sessions_per_week: integer('default_sessions_per_week').default(3),
  equipment_needed: jsonb('equipment_needed'),
  phase_names: jsonb('phase_names'),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  age: integer('age'),
  fitness_level: text('fitness_level'),
  sport_id: uuid('sport_id').references(() => sports.id),
  days_per_week: integer('days_per_week'),
  goal: text('goal'),
  has_partner: boolean('has_partner').default(false),
  created_at: timestamp('created_at').defaultNow(),
});

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id),
  sport_id: uuid('sport_id').references(() => sports.id),
  start_date: date('start_date').notNull(),
  current_week: integer('current_week').default(1),
  status: text('status').default('active'),
  created_at: timestamp('created_at').defaultNow(),
});

export const weeks = pgTable('weeks', {
  id: uuid('id').primaryKey().defaultRandom(),
  plan_id: uuid('plan_id').references(() => plans.id),
  week_number: integer('week_number').notNull(),
  phase: text('phase'),
  focus: text('focus').notNull(),
  milestone: text('milestone').notNull(),
  coach_note: text('coach_note'),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  week_id: uuid('week_id').references(() => weeks.id),
  day_of_week: text('day_of_week'),
  session_type: text('session_type'),
  duration_minutes: integer('duration_minutes'),
  warm_up: text('warm_up'),
  drills: jsonb('drills'),
  cool_down: text('cool_down'),
  session_order: integer('session_order'),
});

export const session_logs = pgTable('session_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  session_id: uuid('session_id').references(() => sessions.id),
  user_id: uuid('user_id').references(() => users.id),
  completed_at: timestamp('completed_at').defaultNow(),
  rating: integer('rating'),
  notes: text('notes'),
  felt_easy: boolean('felt_easy'),
  felt_hard: boolean('felt_hard'),
  skipped: boolean('skipped').default(false),
});
