'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { console } from '@/lib/logger';
import type { PointsTransaction, UserPointsSummary } from '@/types/points';
import {
  CoinsIcon,
  HistoryIcon,
  StarIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface PointsCardProps {
  className?: string;
}

export function PointsCard({ className }: PointsCardProps) {
  const t = useTranslations('Points');
  const [summary, setSummary] = useState<UserPointsSummary | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchPointsSummary();
  }, []);

  const fetchPointsSummary = async () => {
    try {
      const response = await fetch('/api/points/summary');
      const data = await response.json();

      if (data.success) {
        setSummary(data.data);
      }
    } catch (error) {
      console.error('Error fetching points summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/points/transactions?limit=10');
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleShowHistory = async () => {
    if (!showHistory) {
      await fetchTransactions();
    }
    setShowHistory(!showHistory);
  };

  const formatTransactionReason = (reason: string) => {
    return t(`Points.reasons.${reason}` as any) || reason;
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (type === 'earn' || amount > 0) {
      return <TrendingUpIcon className="h-4 w-4 text-green-500" />;
    }
    return <TrendingDownIcon className="h-4 w-4 text-red-500" />;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CoinsIcon className="h-5 w-5" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-muted rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CoinsIcon className="h-5 w-5" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('errorLoading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CoinsIcon className="h-5 w-5" />
            {t('title')}
          </div>
          <Badge variant="secondary" className="text-lg font-bold">
            {summary.totalPoints.toLocaleString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Points Overview */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">{t('totalEarned')}</p>
            <p className="font-semibold text-green-600">
              +{summary.totalEarned.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">{t('totalSpent')}</p>
            <p className="font-semibold text-red-600">
              -{summary.totalSpent.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">{t('thisMonth')}</p>
            <p className="font-semibold">
              +{summary.pointsThisMonth.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">{t('thisYear')}</p>
            <p className="font-semibold">
              +{summary.pointsThisYear.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Latest Transaction */}
        {summary.lastTransaction && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{t('lastTransaction')}</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTransactionIcon(
                    summary.lastTransaction.type,
                    summary.lastTransaction.amount
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {formatTransactionReason(summary.lastTransaction.reason)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(
                        summary.lastTransaction.createdAt
                      ).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    summary.lastTransaction.amount > 0
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {summary.lastTransaction.amount > 0 ? '+' : ''}
                  {summary.lastTransaction.amount.toLocaleString()}
                </Badge>
              </div>
            </div>
          </>
        )}

        {/* History Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleShowHistory}
          className="w-full"
        >
          <HistoryIcon className="h-4 w-4 mr-2" />
          {showHistory ? t('hideHistory') : t('showHistory')}
        </Button>

        {/* Transaction History */}
        {showHistory && (
          <>
            <Separator />
            <ScrollArea className="h-48">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">{t('showHistory')}</h4>
                {transactions.length > 0 ? (
                  <div className="space-y-2">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(
                            transaction.type,
                            transaction.amount
                          )}
                          <div>
                            <p className="text-xs font-medium">
                              {formatTransactionReason(transaction.reason)}
                            </p>
                            {transaction.description && (
                              <p className="text-xs text-muted-foreground">
                                {transaction.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString('zh-CN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            transaction.amount > 0 ? 'default' : 'destructive'
                          }
                          className="text-xs"
                        >
                          {transaction.amount > 0 ? '+' : ''}
                          {transaction.amount.toLocaleString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t('noHistory')}
                  </p>
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
}
