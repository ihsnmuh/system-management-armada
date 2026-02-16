import React from 'react';
import { Badge } from './ui/badge';
import { VehicleCurrentStatus } from '@/types/api/vehicles';
import { cn } from '@/lib/utils';

interface BadgeCustomProps {
  currentStatus: VehicleCurrentStatus;
  variant?:
    | 'outline'
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'ghost'
    | 'link';
  className?: string;
}

const STATUS_CONFIG = {
  [VehicleCurrentStatus.IN_TRANSIT_TO]: {
    label: 'In Transit',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  [VehicleCurrentStatus.STOPPED_AT]: {
    label: 'Stopped',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  [VehicleCurrentStatus.INCOMING_AT]: {
    label: 'At Terminal',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
} as const;

const DEFAULT_STATUS = {
  label: 'Unknown',
  badge: 'bg-gray-50 text-gray-700 border-gray-200',
  dot: 'bg-gray-400',
};

const BadgeCustom = ({
  currentStatus,
  variant = 'outline',
  className,
}: BadgeCustomProps) => {
  const status =
    STATUS_CONFIG[currentStatus as VehicleCurrentStatus] ?? DEFAULT_STATUS;
  return (
    <Badge
      variant={variant}
      className={cn(
        status.badge,
        'shrink-0 flex justify-center items-center',
        className,
      )}
    >
      <span className="relative mr-1.5 flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${status.dot}`}
        />
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${status.dot}`}
        />
      </span>
      {status.label.toUpperCase()}
    </Badge>
  );
};

export default BadgeCustom;
