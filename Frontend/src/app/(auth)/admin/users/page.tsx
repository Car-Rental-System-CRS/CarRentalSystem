'use client';

import { useEffect, useState, useCallback } from 'react';
import { adminService } from '@/services/adminService';
import { AccountAdmin, CustomRole } from '@/types/role';
import Pagination from '@/components/Pagination';
import { Search, UserCog, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/Label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import ScopeGuard from '@/components/ScopeGuard';

export default function UsersPage() {
  const [users, setUsers] = useState<AccountAdmin[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [baseRoleFilter, setBaseRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Role data
  const [roles, setRoles] = useState<CustomRole[]>([]);

  // Assign role dialog
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<AccountAdmin | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

  // Change base role dialog
  const [baseRoleDialogOpen, setBaseRoleDialogOpen] = useState(false);
  const [baseRoleTarget, setBaseRoleTarget] = useState<AccountAdmin | null>(null);
  const [newBaseRole, setNewBaseRole] = useState<string>('');
  const [changingBaseRole, setChangingBaseRole] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({
        page,
        size: 10,
        search: search || undefined,
        baseRole: baseRoleFilter || undefined,
      });
      setUsers(data.items);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
    } catch {
      toast.error('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  }, [page, search, baseRoleFilter]);

  const fetchRoles = useCallback(async () => {
    try {
      const data = await adminService.getRoles();
      setRoles(data);
    } catch {
      console.error('Failed to fetch roles');
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleSearch = () => {
    setPage(0);
    setSearch(searchInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  // --- Assign Role ---
  const openAssignDialog = (user: AccountAdmin) => {
    setAssignTarget(user);
    setSelectedRoleId(user.customRole?.id || '');
    setAssignDialogOpen(true);
  };

  const handleAssignRole = async () => {
    if (!assignTarget || !selectedRoleId) return;
    setAssigning(true);
    try {
      await adminService.assignCustomRole(assignTarget.id, selectedRoleId);
      toast.success(`Role assigned to ${assignTarget.name} successfully.`);
      setAssignDialogOpen(false);
      fetchUsers();
    } catch {
      toast.error('Failed to assign role. Ensure the role matches the user\'s base role.');
    } finally {
      setAssigning(false);
    }
  };

  // --- Change Base Role ---
  const openBaseRoleDialog = (user: AccountAdmin, role: string) => {
    if (role === user.baseRole) return;
    setBaseRoleTarget(user);
    setNewBaseRole(role);
    setBaseRoleDialogOpen(true);
  };

  const handleChangeBaseRole = async () => {
    if (!baseRoleTarget || !newBaseRole) return;
    setChangingBaseRole(true);
    try {
      await adminService.changeBaseRole(baseRoleTarget.id, newBaseRole);
      toast.success(`Base role changed to ${newBaseRole} for ${baseRoleTarget.name}.`);
      setBaseRoleDialogOpen(false);
      fetchUsers();
    } catch {
      toast.error('Failed to change base role.');
    } finally {
      setChangingBaseRole(false);
    }
  };

  const getRolesForBaseRole = (baseRole: string) => {
    return roles.filter((r) => r.baseRole === baseRole);
  };

  const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (role) {
      case 'ADMIN': return 'default';
      case 'STAFF': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          View and manage users, assign roles, and change permissions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Staff Accounts</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.baseRole === 'STAFF').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Custom Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px] max-w-sm space-y-1.5">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-[160px] space-y-1.5">
              <Label>Base Role</Label>
              <Select
                value={baseRoleFilter || 'ALL'}
                onValueChange={(v) => {
                  setBaseRoleFilter(v === 'ALL' ? '' : v);
                  setPage(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            A list of all registered accounts. {totalItems} total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Base Role</TableHead>
                <TableHead>Custom Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '—'}</TableCell>
                    <TableCell>
                      <ScopeGuard scope="USER_ROLE_ASSIGN" fallback={
                        <Badge variant={getRoleBadgeVariant(user.baseRole)}>{user.baseRole}</Badge>
                      }>
                        <Select
                          value={user.baseRole}
                          onValueChange={(v) => openBaseRoleDialog(user, v)}
                        >
                          <SelectTrigger className="w-[100px] h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">USER</SelectItem>
                            <SelectItem value="STAFF">STAFF</SelectItem>
                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                          </SelectContent>
                        </Select>
                      </ScopeGuard>
                    </TableCell>
                    <TableCell>
                      {user.customRole ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {user.customRole.name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Default
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.baseRole !== 'USER' && (
                        <ScopeGuard scope="USER_ROLE_ASSIGN">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openAssignDialog(user)}
                          >
                            <UserCog className="h-4 w-4 mr-1" />
                            Assign Role
                          </Button>
                        </ScopeGuard>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <>
            <Separator />
            <div className="p-4">
              <Pagination
                currentPage={page + 1}
                totalPages={totalPages}
                onPageChange={(p: number) => setPage(p - 1)}
              />
            </div>
          </>
        )}
      </Card>

      {/* ===== Assign Role Dialog ===== */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Custom Role</DialogTitle>
            <DialogDescription>
              Assign a custom role to <strong>{assignTarget?.name}</strong>.
              Only roles matching the <Badge variant={getRoleBadgeVariant(assignTarget?.baseRole || '')} className="mx-1">{assignTarget?.baseRole}</Badge> base role are shown.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Current Role</Label>
              <p className="text-sm text-muted-foreground">
                {assignTarget?.customRole ? assignTarget.customRole.name : 'None (default — full access)'}
              </p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="role-select">New Role</Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger id="role-select">
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  {getRolesForBaseRole(assignTarget?.baseRole || '').map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name} {role.isDefault ? '(Default)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignRole} disabled={!selectedRoleId || assigning}>
              {assigning ? 'Assigning...' : 'Assign Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Change Base Role Dialog ===== */}
      <Dialog open={baseRoleDialogOpen} onOpenChange={setBaseRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Base Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the base role for <strong>{baseRoleTarget?.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <Label className="text-xs text-muted-foreground">Current</Label>
                <div className="mt-1">
                  <Badge variant={getRoleBadgeVariant(baseRoleTarget?.baseRole || '')} className="text-sm">
                    {baseRoleTarget?.baseRole}
                  </Badge>
                </div>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="text-center">
                <Label className="text-xs text-muted-foreground">New</Label>
                <div className="mt-1">
                  <Badge variant={getRoleBadgeVariant(newBaseRole)} className="text-sm">
                    {newBaseRole}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
              <strong>Warning:</strong> Changing the base role will remove the user&apos;s current custom role assignment.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBaseRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleChangeBaseRole} disabled={changingBaseRole}>
              {changingBaseRole ? 'Changing...' : 'Confirm Change'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
