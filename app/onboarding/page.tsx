import { supabaseAdmin } from '@/lib/supabase';
import OnboardingForm from '@/components/OnboardingForm';

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
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900">
            Court<span className="text-green-500">IQ</span>
          </h1>
          <p className="text-gray-500 mt-1">Let&apos;s build your personal training plan</p>
        </div>
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <OnboardingForm sportIds={sportIds} />
        </div>
      </div>
    </main>
  );
}
