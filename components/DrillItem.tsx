'use client';
import { useState } from 'react';
import { Drill } from '@/types';

interface DrillItemProps {
  drill: Drill;
  index: number;
}

function getVideoId(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}

export default function DrillItem({ drill, index }: DrillItemProps) {
  const [done, setDone] = useState(false);
  const videoId = getVideoId(drill.video_url ?? null);
  const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  const difficulty = index === 0 ? { label: 'Foundation', color: 'bg-blue-100 text-blue-700' } : { label: 'Challenge', color: 'bg-orange-100 text-orange-700' };

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${done ? 'opacity-50' : 'border-gray-200 hover:border-green-300 hover:shadow-sm'}`}>
      {thumbnail && (
        <a href={drill.video_url!} target="_blank" rel="noopener noreferrer" className="block relative">
          <img src={thumbnail} alt={drill.name} className="w-full h-36 object-cover" />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-red-600 rounded-full w-12 h-12 flex items-center justify-center">
              <svg className="w-5 h-5 text-white ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        </a>
      )}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => setDone(!done)}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
          >
            {done && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${difficulty.color}`}>{difficulty.label}</span>
              <h4 className={`font-semibold text-gray-900 ${done ? 'line-through text-gray-400' : ''}`}>{drill.name}</h4>
            </div>
            <p className="text-sm font-medium text-green-600 mb-1">{drill.reps}</p>
            <p className="text-sm text-gray-600">{drill.description}</p>
          </div>
        </div>
        {!thumbnail && drill.video_url && (
          <a href={drill.video_url} target="_blank" rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.84 1.56V6.79a4.85 4.85 0 01-1.07-.1z"/></svg>
            Watch on YouTube
          </a>
        )}
      </div>
    </div>
  );
}
