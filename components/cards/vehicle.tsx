import React, { useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Vehicle, Route as RouteType } from '@/types/api';
import { Badge } from '../ui/badge';
import { VehicleOccupancyStatus } from '@/types/api/vehicles';
import BadgeCustom from '../BadgeCustom';

export type VehicleWithRoute = Vehicle & {
  routeDetail: RouteType | null;
};

import { MapPin, Route, Clock, Eye, PersonStanding } from 'lucide-react';
import { Button } from '../ui/button';
import { TypographyH3 } from '../Typography';

const OCCUPANCY_STATUS_CONFIG = {
  [VehicleOccupancyStatus.MANY_SEATS_AVAILABLE]: {
    color: 'text-emerald-500 fill-emerald-500',
  },
  [VehicleOccupancyStatus.FEW_SEATS_AVAILABLE]: {
    color: 'text-amber-500 fill-amber-500',
  },
  [VehicleOccupancyStatus.FULL]: {
    color: 'text-red-500 fill-red-500',
  },
  [VehicleOccupancyStatus.NO_DATA_AVAILABLE]: {
    color: 'text-gray-500 fill-gray-500',
  },
  [VehicleOccupancyStatus.UNKNOWN]: {
    color: 'text-gray-500 fill-gray-500',
  },
} as const;

const VehicleCard = ({ vehicle, onViewDetail }: { vehicle: VehicleWithRoute, onViewDetail: (id: string) => void }) => {
  const { attributes, relationships, routeDetail } = vehicle;

  const updatedAtTimeOnly = useMemo(() => {
    if (!attributes.updated_at) return null;
    const date = new Date(attributes.updated_at);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }, [attributes.updated_at]);

  const occupancyStatus = (status: string) => {
    if (status === 'MANY_SEATS_AVAILABLE') return 1;
    if (status === 'FEW_SEATS_AVAILABLE') return 2;
    if (status === 'FULL') return 3;
    return 0;
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:border-primary/20">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-2">
          <TypographyH3 className="text-primary tracking-tight font-bold">
            {attributes.label}
          </TypographyH3>
          <BadgeCustom currentStatus={attributes.current_status} />
        </div>

        {relationships.route?.data?.id && (
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <Route className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="wrap-break-words font-semibold">
              <Badge
                className="text-white border-none"
                style={{
                  backgroundColor: `#${routeDetail?.attributes.color ?? '000000'}`,
                }}
              >
                {routeDetail?.attributes.short_name ??
                  relationships.route.data.id}
              </Badge>
              {routeDetail?.attributes.long_name
                ? ` ${routeDetail.attributes.long_name}`
                : ''}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 bg-[#F5F7F8] p-2 rounded-md">
          {attributes.latitude && (
            <div className="flex flex-col items-start gap-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs text-muted-foreground">Latitude</span>
              </div>
              <span className="truncate w-full text-primary font-medium">
                {attributes.latitude}
              </span>
            </div>
          )}

          {attributes.longitude && (
            <div className="flex flex-col items-start gap-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs text-muted-foreground">Longitude</span>
              </div>
              <span className="truncate w-full text-primary font-medium">
                {attributes.longitude}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground/80">
          {updatedAtTimeOnly && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span className="text-xs text-muted-foreground text-center">last updated at {updatedAtTimeOnly}</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <span className="truncate text-primary font-medium flex items-center gap-0.5">
              {occupancyStatus(attributes.occupancy_status as string) > 0 ? (
                Array.from({
                  length:
                    occupancyStatus(attributes.occupancy_status as string) * 2,
                }).map((_, index) => (
                  <PersonStanding
                    key={index}
                    className={`h-3 w-3 shrink-0 ${OCCUPANCY_STATUS_CONFIG[attributes.occupancy_status as VehicleOccupancyStatus].color}`}
                  />
                ))
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => onViewDetail(vehicle.id)}>
          <Eye className="h-4 w-4" />
          Lihat Detail
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VehicleCard;
