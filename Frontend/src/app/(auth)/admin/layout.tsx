// app/(auth)/admin/layout.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/sign-in');
  }

  if (session.user.baseRole !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed left-0 top-0 h-screen bg-white border-r">
        <AdminSidebar />
      </div>

      {/* Main content area - offset for sidebar */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
