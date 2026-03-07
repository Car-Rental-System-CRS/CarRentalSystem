'use client';

import { useAuth } from '@/lib/hooks/useAuth';

interface ScopeGuardProps {
  scope: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ScopeGuard({ scope, children, fallback = null }: ScopeGuardProps) {
  const { hasScope } = useAuth();

  if (!hasScope(scope)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
