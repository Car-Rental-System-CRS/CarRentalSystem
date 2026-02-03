import { auth, signOut } from '@/lib/auth';
import axios from '@/lib/axios';

export default async function SignOutForm() {
  const session = await auth();
  const token = (session as any)?.accessToken;

  return (
    <form
      action={async () => {
        'use server';

        // Call backend logout API if token exists
        if (token) {
          try {
            await axios.post('/api/auth/logout', null, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          } catch (error) {
            console.error('Backend logout error:', error);
          }
        }

        await signOut({ redirectTo: '/' });
      }}
    >
      <button type="submit" className="danger-btn">
        Sign Out
      </button>
    </form>
  );
}
