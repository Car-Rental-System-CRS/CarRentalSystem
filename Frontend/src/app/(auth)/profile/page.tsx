import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProfilePageClient from './components/ProfilePageClient';

export default async function ProfilePage() {
  const session = await auth();
  if (!session) {
    redirect('/sign-in');
  }

  const { user } = session;
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-slate-50 py-10">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Renter Profile
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            Manage your account details
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            Keep your contact information current so booking updates and account access stay in
            sync.
          </p>
        </div>

        <ProfilePageClient
          initialProfile={{
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            baseRole: user.baseRole,
            customRole: user.customRoleId && user.customRoleName
              ? { id: user.customRoleId, name: user.customRoleName }
              : null,
            scopes: user.scopes,
          }}
        />
      </div>
    </main>
  );
}
