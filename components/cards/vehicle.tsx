import React, { useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Vehicle, Route as RouteType } from '@/types/api';
import { Badge } from '../ui/badge';
import { VehicleCurrentStatus, VehicleOccupancyStatus } from '@/types/api/vehicles';

export type VehicleWithRoute = Vehicle & {
    routeDetail: RouteType | null;
};

import {
    MapPin,
    Route,
    Clock,
    Eye,
    PersonStanding,
} from 'lucide-react';
import { Button } from '../ui/button';
import { TypographyH3 } from '../Typography';

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

const DEFAULT_STATUS = {
    label: 'Unknown',
    badge: 'bg-gray-50 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
};

const VehicleCard = ({ vehicle }: { vehicle: VehicleWithRoute }) => {
    const { attributes, relationships, routeDetail } = vehicle;

    const status = STATUS_CONFIG[attributes.current_status as VehicleCurrentStatus] ?? DEFAULT_STATUS;

    const updatedAt = useMemo(() => {
        if (!attributes.updated_at) return null;

        const now = new Date();
        const date = new Date(attributes.updated_at);
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
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
                    <Badge variant="outline" className={`${status.badge} shrink-0 flex justify-center items-center`}>
                        <span className="relative mr-1.5 flex h-2 w-2">
                            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${status.dot}`} />
                            <span className={`relative inline-flex h-2 w-2 rounded-full ${status.dot}`} />
                        </span>
                        {status.label.toUpperCase()}
                    </Badge>
                </div>

                {relationships.route?.data?.id && (
                    <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                        <Route className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span className="wrap-break-words font-semibold">
                            <Badge
                                className="text-white border-none"
                                style={{ backgroundColor: `#${routeDetail?.attributes.color ?? '000000'}` }}
                            >
                                {routeDetail?.attributes.short_name ?? relationships.route.data.id}
                            </Badge>
                            {routeDetail?.attributes.long_name ? ` ${routeDetail.attributes.long_name}` : ''}
                        </span>
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 bg-[#F5F7F8] p-2 rounded-md">
                    {/* {relationships.stop?.data?.id && (
                        <div className="flex flex-col items-start gap-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span className="text-xs text-muted-foreground">Stop</span>
                            </div>
                            <span className="truncate text-primary font-medium">{relationships.stop.data.id}</span>
                        </div>
                    )}
                    {relationships.trip?.data?.id && (
                        <div className="flex flex-col items-start gap-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Route className="h-3.5 w-3.5 shrink-0" />
                                <span className="text-xs text-muted-foreground">Trip</span>
                            </div>
                            <span className="truncate text-primary font-medium">{relationships.trip.data.id}</span>
                        </div>
                    )} */}

                    {attributes.latitude && (
                        <div className="flex flex-col items-start gap-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span className="text-xs text-muted-foreground">Latitude</span>
                            </div>
                            <span className="truncate text-primary font-medium">{attributes.latitude}</span>
                        </div>
                    )}

                    {attributes.longitude && (
                        <div className="flex flex-col items-start gap-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span className="text-xs text-muted-foreground">Longitude</span>
                            </div>
                            <span className="truncate text-primary font-medium">{attributes.longitude}</span>
                        </div>
                    )}

                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground/80">
                    {updatedAt && (
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{updatedAt}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-1">
                        <span className="truncate text-primary font-medium flex items-center gap-0.5">
                            {occupancyStatus(attributes.occupancy_status as string) > 0 ? (
                                Array.from({ length: occupancyStatus(attributes.occupancy_status as string) * 2 }).map((_, index) => (
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
                <Button variant="outline" size="sm" className='cursor-pointer'>
                    <Eye className="h-4 w-4" />
                    View
                </Button>
            </CardFooter>
        </Card>
    );
};

export default VehicleCard;
