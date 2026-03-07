'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminService } from '@/services/adminService';
import { CustomRole, SCOPE_LABELS } from '@/types/role';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Shield, Eye } from 'lucide-react';
import { toast } from 'sonner';
import ScopeGuard from '@/components/ScopeGuard';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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

export default function RolesPage() {
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomRole | null>(null);
  const [deleting, setDeleting] = useState(false);

  // View scopes dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<CustomRole | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getRoles();
      setRoles(data);
    } catch {
      toast.error('Failed to fetch roles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const openDeleteDialog = (role: CustomRole) => {
    setDeleteTarget(role);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminService.deleteRole(deleteTarget.id);
      toast.success(`Role "${deleteTarget.name}" deleted successfully.`);
      setDeleteDialogOpen(false);
      fetchRoles();
    } catch {
      toast.error('Failed to delete role. Default roles cannot be deleted.');
    } finally {
      setDeleting(false);
    }
  };

  const openViewDialog = (role: CustomRole) => {
    setViewTarget(role);
    setViewDialogOpen(true);
  };

  const getRoleBadgeVariant = (baseRole: string): 'default' | 'secondary' | 'outline' => {
    switch (baseRole) {
      case 'ADMIN': return 'default';
      case 'STAFF': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Create and manage custom roles with specific permissions.
          </p>
        </div>
        <ScopeGuard scope="ROLE_CREATE">
          <Button asChild>
            <Link href="/admin/roles/create">
              <Plus className="h-4 w-4 mr-1" />
              Create Role
            </Link>
          </Button>
        </ScopeGuard>
      </div>

      {/* Role Cards */}
      {loading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading...
          </CardContent>
        </Card>
      ) : roles.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No roles found. Create your first custom role to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <Badge variant={getRoleBadgeVariant(role.baseRole)}>
                          {role.baseRole}
                        </Badge>
                        {role.isDefault && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Default
                          </Badge>
                        )}
                      </div>
                      {role.description && (
                        <CardDescription className="mt-1">
                          {role.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openViewDialog(role)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {!role.isDefault && (
                      <>
                        <ScopeGuard scope="ROLE_EDIT">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/roles/${role.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        </ScopeGuard>
                        <ScopeGuard scope="ROLE_DELETE">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => openDeleteDialog(role)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </ScopeGuard>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Permissions ({role.scopes.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {role.scopes.slice(0, 8).map((scope) => (
                      <Badge key={scope} variant="outline" className="text-xs font-normal">
                        {SCOPE_LABELS[scope] || scope}
                      </Badge>
                    ))}
                    {role.scopes.length > 8 && (
                      <Badge
                        variant="outline"
                        className="text-xs font-normal cursor-pointer hover:bg-accent"
                        onClick={() => openViewDialog(role)}
                      >
                        +{role.scopes.length - 8} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ===== View Scopes Dialog ===== */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewTarget?.name}
              <Badge variant={getRoleBadgeVariant(viewTarget?.baseRole || '')}>
                {viewTarget?.baseRole}
              </Badge>
              {viewTarget?.isDefault && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Default
                </Badge>
              )}
            </DialogTitle>
            {viewTarget?.description && (
              <DialogDescription>{viewTarget.description}</DialogDescription>
            )}
          </DialogHeader>

          <Separator />

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            <p className="text-sm font-medium">
              All Permissions ({viewTarget?.scopes.length})
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {viewTarget?.scopes.map((scope) => (
                <div
                  key={scope}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 text-sm"
                >
                  <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {SCOPE_LABELS[scope] || scope}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Delete Confirmation Dialog ===== */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the role <strong>&quot;{deleteTarget?.name}&quot;</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            Any users currently assigned this role will lose their custom role assignment and revert to full access for their base role.
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
