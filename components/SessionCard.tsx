'use client';

import Link from 'next/link';
import { SessionData } from '@/types';

interface SessionCardProps {
  session: SessionData;
  isCompleted?: boolean;
  isCurrent?: boolean;
}

const sessionTypeColors: Record<string, string> = {
  solo: 'bg-blue-100 text-blue-700',
  partner: 'bg-purple-100 text-purple-700',
  match: 'bg-orange-100 text-orange-700',
  rest: 'bg-gray-100 text-gray-600',
};

const dayAbbrev: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

export default function SessionCard({ session, isCompleted, isCurrent }: SessionCardProps) {
  return (
    <Link href={`/session/${session.id}`}>
      <div className={`relative border rounded-xl p-3 cursor-pointer transition-all hover:shadow-md ${
        isCompleted ? 'bg-gray-50 border-gray-200 opacity-70' :
        isCurrent ? 'bg-green-50 border-green-400 shadow-sm' :
        'bg-white border-gray-200 hover:border-green-300'
      }`}>
        {isCurrent && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Next</div>
        )}
        {isCompleted && (
          <div className="absolute -top-2 -right-2 bg-gray-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">✓</div>
        )}
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-gray-500 uppercase">{dayAbbrev[session.day_of_week] || session.day_of_week}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sessionTypeColors[session.session_type] || 'bg-gray-100 text-gray-600'}`}>
            {session.session_type}
          </span>
        </div>
        <p className="text-xs text-gray-500">{session.duration_minutes} min</p>
        <p className="text-xs text-gray-400 mt-1">{(session.drills || []).length} drills</p>
      </div>
    </Link>
  );
}
