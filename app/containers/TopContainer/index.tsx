'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { TypographyH3, TypographyMuted } from '@/components/Typography';

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const TopContainer = () => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setCurrentTime(new Date());
    const timeout = setTimeout(update, 0);
    const interval = setInterval(update, 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="layout">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <TypographyH3 className="text-primary font-bold">
            Dashboard Armada
          </TypographyH3>
          <TypographyMuted>
            Monitoring sistem armada secara real-time
          </TypographyMuted>
        </div>

        {currentTime && (
          <Card className="py-3 shadow-none">
            <CardContent className="flex items-center text-center gap-3 text-lg font-semibold tabular-nums text-primary">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-primary font-bold">
                {formatDate(currentTime)}
              </span>
              <span className="text-muted-foreground">|</span>
              <span className="text-primary font-bold">
                {formatTime(currentTime)} WIB
              </span>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TopContainer;
