'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { AccountProfile } from '@/types/user';
import { Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';

type ProfileOverviewProps = {
  profile: AccountProfile;
};

export default function ProfileOverview({ profile }: ProfileOverviewProps) {
  const showAccessContext = profile.baseRole !== 'USER';

  return (
    <Card className="border-slate-200 shadow-lg">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-slate-900">Account Overview</CardTitle>
            <CardDescription>
              Review the account details currently used for bookings and communication.
            </CardDescription>
          </div>
          {showAccessContext ? (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
              {profile.baseRole}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
            <UserRound className="h-4 w-4" />
            Full Name
          </div>
          <p className="text-base font-semibold text-slate-900">{profile.name}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
            <Mail className="h-4 w-4" />
            Email
          </div>
          <p className="text-base font-semibold text-slate-900 break-all">{profile.email}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
            <Phone className="h-4 w-4" />
            Phone
          </div>
          <p className="text-base font-semibold text-slate-900">{profile.phone || 'Not provided'}</p>
        </div>
        {showAccessContext ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 md:col-span-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
              <ShieldCheck className="h-4 w-4" />
              Access Context
            </div>
            <p className="text-sm text-slate-700">
              Role: <span className="font-medium text-slate-900">{profile.baseRole}</span>
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Scopes:{' '}
              <span className="font-medium text-slate-900">
                {profile.scopes.length > 0 ? profile.scopes.join(', ') : 'No additional scopes'}
              </span>
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
