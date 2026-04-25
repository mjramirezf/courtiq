'use client';

import { Drill } from '@/types';

interface DrillItemProps {
  drill: Drill;
  index: number;
}

export default function DrillItem({ drill, index }: DrillItemProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-green-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">#{index + 1}</span>
            <h4 className="font-semibold text-gray-900">{drill.name}</h4>
          </div>
          <p className="text-sm text-gray-500 font-medium mb-2">{drill.reps}</p>
          <p className="text-sm text-gray-600">{drill.description}</p>
        </div>
        {drill.video_url && (
          <a
            href={drill.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.56V6.79a4.85 4.85 0 01-1.07-.1z"/>
            </svg>
            Watch
          </a>
        )}
      </div>
    </div>
  );
}
