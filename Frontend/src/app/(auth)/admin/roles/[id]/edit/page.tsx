'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/services/adminService';
import { STAFF_SCOPES, ADMIN_SCOPES, SCOPE_LABELS } from '@/types/role';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const STAFF_SCOPE_GROUPS: { label: string; scopes: string[] }[] = [
  { label: 'Car Brands', scopes: ['CAR_BRAND_VIEW', 'CAR_BRAND_CREATE', 'CAR_BRAND_EDIT', 'CAR_BRAND_DELETE'] },
  { label: 'Car Features', scopes: ['CAR_FEATURE_VIEW', 'CAR_FEATURE_CREATE', 'CAR_FEATURE_EDIT', 'CAR_FEATURE_DELETE'] },
  { label: 'Car Types', scopes: ['CAR_TYPE_VIEW', 'CAR_TYPE_CREATE', 'CAR_TYPE_EDIT', 'CAR_TYPE_DELETE', 'CAR_TYPE_IMAGE_MANAGE'] },
  { label: 'Cars', scopes: ['CAR_VIEW', 'CAR_CREATE', 'CAR_EDIT', 'CAR_DELETE'] },
  { label: 'Model Features', scopes: ['MODEL_FEATURE_MANAGE'] },
  { label: 'Bookings & Payments', scopes: ['BOOKING_MANAGE', 'PAYMENT_VIEW'] },
];

const ADMIN_SCOPE_GROUPS: { label: string; scopes: string[] }[] = [
  { label: 'Dashboard', scopes: ['DASHBOARD_VIEW'] },
  { label: 'User Management', scopes: ['USER_VIEW', 'USER_EDIT', 'USER_ROLE_ASSIGN'] },
  { label: 'Role Management', scopes: ['ROLE_VIEW', 'ROLE_CREATE', 'ROLE_EDIT', 'ROLE_DELETE'] },
];

export default function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [baseRole, setBaseRole] = useState<'STAFF' | 'ADMIN'>('STAFF');
  const [selectedScopes, setSelectedScopes] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);

  const scopeGroups = baseRole === 'STAFF' ? STAFF_SCOPE_GROUPS : ADMIN_SCOPE_GROUPS;
  const allScopes = baseRole === 'STAFF' ? [...STAFF_SCOPES] : [...ADMIN_SCOPES];

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const role = await adminService.getRoleById(id);
        setName(role.name);
        setDescription(role.description || '');
        setBaseRole(role.baseRole as 'STAFF' | 'ADMIN');
        setSelectedScopes(new Set(role.scopes));
      } catch {
        toast.error('Failed to load role data.');
        setError('Failed to load role data.');
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, [id]);

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) => {
      const next = new Set(prev);
      if (next.has(scope)) next.delete(scope);
      else next.add(scope);
      return next;
    });
  };

  const toggleGroupAll = (scopes: string[]) => {
    const allSelected = scopes.every((s) => selectedScopes.has(s));
    setSelectedScopes((prev) => {
      const next = new Set(prev);
      scopes.forEach((s) => (allSelected ? next.delete(s) : next.add(s)));
      return next;
    });
  };

  const selectAll = () => setSelectedScopes(new Set(allScopes));
  const deselectAll = () => setSelectedScopes(new Set());

  const validateAndConfirm = () => {
    if (!name.trim()) { setError('Role name is required.'); return; }
    if (selectedScopes.size === 0) { setError('Please select at least one permission.'); return; }
    setError('');
    setConfirmOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await adminService.updateRole(id, {
        name: name.trim(),
        description: description.trim() || undefined,
        scopes: Array.from(selectedScopes),
      });
      toast.success(`Role "${name.trim()}" updated successfully.`);
      router.push('/admin/roles');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update role.');
      setConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/admin/roles">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Roles
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Role</h1>
        <p className="text-muted-foreground">
          Modify role details and permissions.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main Form */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Role Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Base Role (read-only) */}
          <Card>
            <CardHeader>
              <CardTitle>Base Role</CardTitle>
              <CardDescription>
                Base role cannot be changed after role creation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant={baseRole === 'ADMIN' ? 'default' : 'secondary'} className="text-sm">
                {baseRole}
              </Badge>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Permissions</CardTitle>
                  <CardDescription>
                    Update the permissions for this role.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="link" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                  <Separator className="h-4 w-px" />
                  <Button type="button" variant="link" size="sm" onClick={deselectAll}>
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {scopeGroups.map((group) => {
                const allInGroupSelected = group.scopes.every((s) => selectedScopes.has(s));
                return (
                  <div key={group.label} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold">{group.label}</h4>
                        <Badge variant="outline" className="text-xs">
                          {group.scopes.filter((s) => selectedScopes.has(s)).length}/{group.scopes.length}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleGroupAll(group.scopes)}
                      >
                        {allInGroupSelected ? 'Deselect' : 'Select All'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.scopes.map((scope) => (
                        <label
                          key={scope}
                          className={`flex items-center gap-2.5 rounded-md border px-3 py-2 cursor-pointer transition-colors ${
                            selectedScopes.has(scope)
                              ? 'bg-primary/5 border-primary/30'
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                              selectedScopes.has(scope)
                                ? 'bg-primary border-primary text-primary-foreground'
                                : 'border-input'
                            }`}
                            onClick={() => toggleScope(scope)}
                          >
                            {selectedScopes.has(scope) && <Check className="h-3 w-3" />}
                          </div>
                          <span className="text-sm">{SCOPE_LABELS[scope] || scope}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>{' '}
                <span className="font-medium">{name || '—'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Base Role:</span>{' '}
                <Badge variant={baseRole === 'ADMIN' ? 'default' : 'secondary'}>
                  {baseRole}
                </Badge>
              </div>
              <Separator />
              <div>
                <span className="text-muted-foreground">Permissions:</span>{' '}
                <span className="font-medium">
                  {selectedScopes.size} of {allScopes.length}
                </span>
              </div>
              {selectedScopes.size > 0 && (
                <div className="flex flex-wrap gap-1">
                  {Array.from(selectedScopes).slice(0, 6).map((scope) => (
                    <Badge key={scope} variant="outline" className="text-xs font-normal">
                      {SCOPE_LABELS[scope] || scope}
                    </Badge>
                  ))}
                  {selectedScopes.size > 6 && (
                    <Badge variant="outline" className="text-xs font-normal">
                      +{selectedScopes.size - 6} more
                    </Badge>
                  )}
                </div>
              )}
              <Separator />
              <Button className="w-full" onClick={validateAndConfirm} disabled={submitting}>
                Save Changes
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/roles">Cancel</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ===== Confirm Dialog ===== */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Changes</DialogTitle>
            <DialogDescription>
              Please confirm the updated role details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Base Role</span>
              <Badge variant={baseRole === 'ADMIN' ? 'default' : 'secondary'}>{baseRole}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Permissions</span>
              <span className="font-medium">{selectedScopes.size} selected</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Saving...' : 'Confirm & Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
