'use client';

import { useEffect, useState } from 'react';
import { accountService } from '@/services/accountService';
import { AccountProfile, UpdateAccountProfilePayload } from '@/types/user';
import { handleError, handleSuccess } from '@/lib/errorHandler';
import { useSessionStatus } from '@/components/SessionProvider';
import ProfileForm from './ProfileForm';
import ProfileOverview from './ProfileOverview';

type ProfilePageClientProps = {
  initialProfile: AccountProfile;
};

export default function ProfilePageClient({ initialProfile }: ProfilePageClientProps) {
  const [profile, setProfile] = useState<AccountProfile>(initialProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const { syncProfile } = useSessionStatus();

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const freshProfile = await accountService.getMyProfile();
        if (!active) {
          return;
        }
        setProfile(freshProfile);
        setLoadFailed(false);
      } catch (error) {
        if (!active) {
          return;
        }
        setLoadFailed(true);
        handleError(error, 'Failed to load your profile.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleUpdate = async (payload: UpdateAccountProfilePayload) => {
    setIsSaving(true);
    try {
      const updatedProfile = await accountService.updateMyProfile(payload);
      setProfile(updatedProfile);
      await syncProfile(updatedProfile);
      handleSuccess('Profile updated', 'Your account information has been saved.');
    } catch (error) {
      handleError(error, 'Failed to update your profile.');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        We couldn&apos;t load your profile right now. Refresh the page and try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileOverview profile={profile} />
      <ProfileForm profile={profile} isSaving={isSaving} onSubmit={handleUpdate} />
    </div>
  );
}
