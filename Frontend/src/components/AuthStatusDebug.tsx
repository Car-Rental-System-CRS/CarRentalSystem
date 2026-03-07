'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';

/**
 * Debug component to show authentication status
 * Remove this in production
 */
export function AuthStatusDebug() {
  const { data: session, status } = useSession();
  const [tokenPreview, setTokenPreview] = useState<string>('');

  useEffect(() => {
    if (session?.accessToken) {
      const token = session.accessToken as string;
      // Show first and last 10 characters of token
      const preview = token.length > 20 
        ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}`
        : token;
      setTokenPreview(preview);
    }
  }, [session]);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Auth Status</span>
          <Badge variant={status === 'authenticated' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        {session?.user && (
          <div className="space-y-1">
            <div><strong>User:</strong> {session.user.name}</div>
            <div><strong>Email:</strong> {session.user.email}</div>
            <div><strong>ID:</strong> {session.user.id}</div>
          </div>
        )}
        {session?.accessToken && (
          <div className="pt-2 border-t">
            <div><strong>Token:</strong></div>
            <div className="font-mono text-[10px] bg-muted p-1 rounded break-all">
              {tokenPreview}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              ✓ All API requests will include this token
            </div>
          </div>
        )}
        {status === 'unauthenticated' && (
          <div className="text-muted-foreground">
            Not logged in. API requests will be made without authentication.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
