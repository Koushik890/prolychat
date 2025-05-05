'use client';

import { cn } from '@/lib/utils';
import { AutomatedActivityChart } from '../visualizations/AutomatedActivityChart';

interface AutomatedActivityCardProps {
  className?: string;
}

export function AutomatedActivityCard({ className }: AutomatedActivityCardProps) {
  return (
    <div className={cn("h-full w-full", className)}>
      <AutomatedActivityChart className="w-full" />
    </div>
  );
}
