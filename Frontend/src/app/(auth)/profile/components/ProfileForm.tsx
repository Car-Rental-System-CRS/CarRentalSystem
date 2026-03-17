'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { AccountProfile, UpdateAccountProfilePayload } from '@/types/user';

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || /^[0-9+\-\s()]{10,20}$/.test(value),
      'Phone number format is invalid'
    ),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type ProfileFormProps = {
  profile: AccountProfile;
  isSaving: boolean;
  onSubmit: (payload: UpdateAccountProfilePayload) => Promise<void>;
};

export default function ProfileForm({ profile, isSaving, onSubmit }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      phone: profile.phone ?? '',
    },
  });

  useEffect(() => {
    reset({
      name: profile.name,
      email: profile.email,
      phone: profile.phone ?? '',
    });
  }, [profile, reset]);

  const submit = async (values: ProfileFormValues) => {
    await onSubmit({
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
    });
  };

  return (
    <Card className="border-slate-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-slate-900">Edit Profile</CardTitle>
        <CardDescription>
          Update the contact details used for account access and booking communication.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(submit)}>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name ? <p className="text-sm text-red-500">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email ? <p className="text-sm text-red-500">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" placeholder="+84 123 456 789" {...register('phone')} />
            {errors.phone ? <p className="text-sm text-red-500">{errors.phone.message}</p> : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={isSaving || !isDirty} className="sm:min-w-36">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving || !isDirty}
              onClick={() =>
                reset({
                  name: profile.name,
                  email: profile.email,
                  phone: profile.phone ?? '',
                })
              }
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
