'use client';

import { WeekData } from '@/types';
import SessionCard from './SessionCard';

interface WeekGridProps {
  weeks: WeekData[];
  currentWeek: number;
  completedSessionIds: Set<string>;
}

const phaseColors: Record<string, string> = {
  fundamentals: 'bg-blue-100 text-blue-700 border-blue-200',
  skill_building: 'bg-purple-100 text-purple-700 border-purple-200',
  match_prep: 'bg-orange-100 text-orange-700 border-orange-200',
};

const phaseLabels: Record<string, string> = {
  fundamentals: 'Fundamentals',
  skill_building: 'Skill Building',
  match_prep: 'Match Prep',
};

export default function WeekGrid({ weeks, currentWeek, completedSessionIds }: WeekGridProps) {
  return (
    <div className="space-y-6">
      {weeks.map((week) => (
        <div key={week.id} className={`rounded-2xl border p-5 ${week.week_number === currentWeek ? 'border-green-400 shadow-md' : 'border-gray-200'}`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900">Week {week.week_number}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${phaseColors[week.phase] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {phaseLabels[week.phase] || week.phase}
                </span>
                {week.week_number === currentWeek && (
                  <span className="text-xs font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">Current</span>
                )}
              </div>
              <h3 className="font-semibold text-gray-800">{week.focus}</h3>
              <p className="text-xs text-gray-500 mt-0.5">🎯 {week.milestone}</p>
            </div>
          </div>
          {week.coach_note && (
            <p className="text-sm text-gray-600 italic bg-gray-50 rounded-lg px-3 py-2 mb-3">&quot;{week.coach_note}&quot;</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {(week.sessions || []).map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isCompleted={completedSessionIds.has(session.id)}
                isCurrent={week.week_number === currentWeek && !completedSessionIds.has(session.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
