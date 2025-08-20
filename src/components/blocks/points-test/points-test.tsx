'use client';

import React from 'react';
import { console } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from '@/hooks/use-session';
import { CoinsIcon, TrendingDownIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

export default function PointsTestSection() {
  const t = useTranslations('HomePage.pointsTest');
  const session = useSession();
  const [amount, setAmount] = useState<string>('10');
  const [loading, setLoading] = useState<boolean>(false);
  const [userPoints, setUserPoints] = useState<number | null>(null);

  // Fetch user points on component mount
  const fetchUserPoints = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch('/api/points/balance');
      if (response.ok) {
        const data = await response.json();
        setUserPoints(data.totalPoints || 0);
      }
    } catch (error) {
      console.error('Failed to fetch user points:', error);
    }
  };

  // Use effect to fetch points when session is available
  React.useEffect(() => {
    fetchUserPoints();
  }, [session]);

  const handleSpendPoints = async () => {
    if (!session?.user?.id) {
      toast.error(t('loginRequired'));
      return;
    }

    const pointsToSpend = parseInt(amount);
    if (isNaN(pointsToSpend) || pointsToSpend <= 0) {
      toast.error(t('invalidAmount'));
      return;
    }

    if (userPoints !== null && pointsToSpend > userPoints) {
      toast.error(t('insufficientPoints'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/points/spend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: pointsToSpend,
          description: t('testSpendDescription'),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(t('spendSuccess', { amount: pointsToSpend }));
        setUserPoints(data.newBalance);
      } else {
        const error = await response.json();
        toast.error(error.message || t('spendFailed'));
      }
    } catch (error) {
      console.error('Failed to spend points:', error);
      toast.error(t('spendFailed'));
    } finally {
      setLoading(false);
    }
  };


  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4">
          <CoinsIcon className="mx-auto h-12 w-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {t('title')}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CoinsIcon className="h-5 w-5" />
              {t('cardTitle')}
            </CardTitle>
            <CardDescription>
              {t('cardDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Points Display */}
            {session?.user && userPoints !== null && (
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {t('currentPoints')}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {userPoints.toLocaleString()}
                </p>
              </div>
            )}

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">{t('amountLabel')}</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10"
                min="1"
                max="10000"
              />
              <p className="text-xs text-muted-foreground">
                {t('amountHint')}
              </p>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleSpendPoints}
                disabled={loading || !session?.user}
                className="w-full max-w-xs"
                variant="default"
              >
                <TrendingDownIcon className="mr-2 h-4 w-4" />
                {loading ? t('processing') : t('spendButton')}
              </Button>
            </div>

            {/* Login Prompt */}
            {!session?.user && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {t('loginPrompt')}{' '}
                  <a
                    href="/auth/login"
                    className="font-medium text-primary hover:underline"
                  >
                    {t('loginLink')}
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}