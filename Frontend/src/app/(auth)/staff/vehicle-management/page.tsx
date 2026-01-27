import SignOutForm from '@/components/SignOutForm';
import { auth } from '@/lib/auth';
import Image from 'next/image';

export default async function ProfilePage() {
  const session = await auth();
  if (!session) return null;

  const { user } = session;
  if (!user) return null;

  const { name, email } = user;

  return (
    <div>
      <h1>Profile</h1>
      <p className="text-zinc-300">
        This page is protected. You can only see your own profile when you are
        signed in.
      </p>
      <div className="flex flex-col place-items-center my-3">
        <p>Name: {name}</p>
        <p>Email: {email}</p>
        <SignOutForm />
      </div>
    </div>
  );
}
