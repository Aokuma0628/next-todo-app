'use client';

import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

export function UserMenu() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({
        callbackUrl: '/auth/signin',
      });
    } catch (error) {
      console.error('ログアウトエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
            <p className="text-sm text-gray-500">{session.user.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut} disabled={isLoading}>
            {isLoading ? 'ログアウト中...' : 'ログアウト'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
