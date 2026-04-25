'use client';

interface CoachMessageProps {
  greeting: string;
  todays_tip: string;
  mental_cue: string;
  what_to_notice: string;
}

export default function CoachMessage({ greeting, todays_tip, mental_cue, what_to_notice }: CoachMessageProps) {
  return (
    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">🏆</div>
        <span className="font-bold text-lg">Coach Message</span>
      </div>
      <p className="text-lg font-medium mb-4">{greeting}</p>
      <div className="grid gap-3">
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-xs text-green-100 font-semibold uppercase tracking-wide mb-1">Today&apos;s Tip</p>
          <p className="text-sm">{todays_tip}</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-xs text-green-100 font-semibold uppercase tracking-wide mb-1">Mental Cue</p>
          <p className="text-sm font-semibold italic">&quot;{mental_cue}&quot;</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3">
          <p className="text-xs text-green-100 font-semibold uppercase tracking-wide mb-1">Watch For</p>
          <p className="text-sm">{what_to_notice}</p>
        </div>
      </div>
    </div>
  );
}
