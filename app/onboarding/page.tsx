import { supabaseAdmin } from '@/lib/supabase';
import OnboardingForm from '@/components/OnboardingForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const { data: sports } = await supabaseAdmin.from('sports').select('id, name');
  const sportIds: Record<string, string> = {};
  if (sports) {
    for (const s of sports) {
      sportIds[s.name.toLowerCase()] = s.id;
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/" className="text-2xl font-black">Court<span className="text-green-400">IQ</span></Link>
        <span className="text-sm text-gray-500">Your personal AI coach</span>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <OnboardingForm sportIds={sportIds} />
        </div>
      </div>
    </main>
  );
}
