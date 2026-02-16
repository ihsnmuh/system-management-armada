'use client';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    VehicleCurrentStatus,
    VehicleOccupancyStatus,
} from '@/types/api/vehicles';
import { Button } from '@/components/ui/button';
import {
    Bus,
    CheckCircle2,
    Clock,
    Loader2,
    MapPin,
    RefreshCw,
    Route,
    Ship,
    Train,
} from 'lucide-react';
import BadgeCustom from './BadgeCustom';
import type {
    ApiDetailResponse,
    Route as RouteType,
    Stop,
    Trip,
    Vehicle,
} from '@/types/api';
import LeafletMap from './LeafletMap';
import { useTripDetail } from '@/hooks/queries/use-trips';
import { decodeMBTAPolyline } from '@/lib/decodepolymap';
import { useSchedules } from '@/hooks/queries/use-schedules';
import { bearingToDirection } from '@/lib/utils';

function occupancyLabel(status: VehicleOccupancyStatus | null): string {
    if (!status) return '—';
    const labels: Record<VehicleOccupancyStatus, string> = {
        [VehicleOccupancyStatus.MANY_SEATS_AVAILABLE]: 'Banyak kursi tersedia',
        [VehicleOccupancyStatus.FEW_SEATS_AVAILABLE]: 'Sedikit kursi tersedia',
        [VehicleOccupancyStatus.FULL]: 'Penuh',
        [VehicleOccupancyStatus.NO_DATA_AVAILABLE]: 'Data tidak tersedia',
        [VehicleOccupancyStatus.UNKNOWN]: 'Tidak diketahui',
    };
    return labels[status] ?? '—';
}

interface DialogDetailProps {
    isOpen: boolean;
    onClose: () => void;
    vehicleId?: string;
    vehicleDetail?: ApiDetailResponse<
        Vehicle,
        RouteType | Trip | Stop | Record<string, unknown>
    > | null;
    isLoading: boolean;
    isFetching: boolean;
    isRefetching: boolean;
    onRefresh?: () => void;
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="space-y-0.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
            <p className="text-sm">{value ?? '—'}</p>
        </div>
    );
}

function DialogDetailSkeleton() {
    return (
        <div className="px-6 py-4">
            <div className="space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div className="space-y-2 flex-1">
                        <div className="h-4 w-32 rounded bg-muted" />
                        <div className="h-3 w-40 rounded bg-muted" />
                    </div>
                    <div className="h-6 w-20 rounded-full bg-muted" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="h-3 w-24 rounded bg-muted" />
                        <div className="h-3 w-32 rounded bg-muted" />
                        <div className="h-3 w-28 rounded bg-muted" />
                        <div className="h-3 w-20 rounded bg-muted" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 w-28 rounded bg-muted" />
                        <div className="h-3 w-24 rounded bg-muted" />
                        <div className="h-3 w-32 rounded bg-muted" />
                        <div className="h-3 w-20 rounded bg-muted" />
                    </div>
                </div>

                <div className="h-64 w-full rounded-lg bg-muted" />
            </div>
        </div>
    );
}

export function DialogDetail({
    isOpen,
    onClose,
    vehicleDetail,
    isLoading,
    isFetching,
    isRefetching,
    onRefresh,
}: DialogDetailProps) {
    const isBusy = isLoading || isFetching || isRefetching;

    const routeId = vehicleDetail?.data?.relationships?.route?.data?.id;
    const tripId = vehicleDetail?.data?.relationships?.trip?.data?.id;
    const stopId = vehicleDetail?.data?.relationships?.stop?.data?.id;

    const included = vehicleDetail?.included ?? [];
    const routeDetail = included.find(
        (item): item is RouteType =>
            item.type === 'route' && 'attributes' in item && item.id === routeId,
    );
    const colorRoute = routeDetail?.attributes?.color;
    const tripDetail = included.find(
        (item): item is Trip =>
            item.type === 'trip' && 'attributes' in item && item.id === tripId,
    );
    const stopDetail = included.find(
        (item): item is Stop =>
            item.type === 'stop' && 'attributes' in item && item.id === stopId,
    );

    const attrs = vehicleDetail?.data?.attributes;
    const routeType = routeDetail?.attributes?.type;

    const updatedAt = attrs?.updated_at;
    const lastUpdatedFormatted = updatedAt
        ? new Date(updatedAt).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }) + ' WIB'
        : '—';

    const speedKmh = attrs?.speed != null ? Math.round(attrs.speed * 3.6) : null;

    const directionId =
        attrs?.direction_id ?? tripDetail?.attributes?.direction_id;
    const directionLabel =
        directionId != null && routeDetail?.attributes?.direction_names?.length
            ? routeDetail.attributes.direction_names[directionId]
            : null;

    const vehiclePosition =
        attrs?.latitude != null && attrs?.longitude != null
            ? ([attrs.latitude, attrs.longitude] as [number, number])
            : null;

    const stopPosition =
        stopDetail?.attributes?.latitude != null &&
            stopDetail?.attributes?.longitude != null
            ? ([stopDetail.attributes.latitude, stopDetail.attributes.longitude] as [
                number,
                number,
            ])
            : null;

    const { data: scheduleDetail } = useSchedules(
        tripDetail?.id
            ? {
                filterTrip: tripDetail.id,
                include: 'stop',
                limit: 50,
            }
            : undefined,
    );

    const schedules = scheduleDetail?.data ?? [];

    const includedScheduleStops = (scheduleDetail?.included ?? []).filter(
        (item): item is Stop => item.type === 'stop' && 'attributes' in item,
    );

    const scheduleStopById = new Map(
        includedScheduleStops.map((stop) => [stop.id, stop]),
    );

    const scheduleCoordinates: [number, number][] = schedules
        .slice()
        .sort(
            (a, b) =>
                (a.attributes.stop_sequence ?? 0) - (b.attributes.stop_sequence ?? 0),
        )
        .map((schedule) => {
            const scheduleStopId = schedule.relationships.stop.data?.id;
            if (!scheduleStopId) return null;

            // Hindari menimpa marker halte utama supaya popup tetap bisa diklik
            if (scheduleStopId === stopId) return null;

            const scheduleStop = scheduleStopById.get(scheduleStopId);
            if (!scheduleStop) return null;

            const lat = scheduleStop.attributes.latitude;
            const lng = scheduleStop.attributes.longitude;
            if (lat == null || lng == null) return null;

            return [lat, lng] as [number, number];
        })
        .filter((coord): coord is [number, number] => coord !== null);

    const { data: tripDetailWithShape } = useTripDetail(tripDetail?.id ?? '', {
        include: 'shape',
    });
    const shape = tripDetailWithShape?.included?.find(
        (item) => item.type === 'shape',
    ) as { attributes: { polyline: string } } | undefined;
    const polyline = shape?.attributes.polyline ?? null;
    const shapeCoordinates = polyline ? decodeMBTAPolyline(polyline) : [];

    const mapCenter =
        vehiclePosition ??
        stopPosition ??
        shapeCoordinates[0] ??
        scheduleCoordinates[0] ??
        null;

    const mapMarkers = [
        ...(vehiclePosition
            ? [
                {
                    id: 'vehicle',
                    position: vehiclePosition,
                    popup: attrs?.label ? `Kendaraan: ${attrs.label}` : 'Kendaraan',
                },
            ]
            : []),
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="sm:max-w-2xl md:max-w-3xl lg:max-w-5xl gap-0 p-0"
                closeOnClickOutside={false}
            >
                {/* Header */}
                <DialogHeader className="flex flex-row items-start justify-between gap-4 border-b px-6 py-4 text-left">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            {routeType === 0 || routeType === 1 || routeType === 2 ? (
                                <span
                                    className={`flex size-8 shrink-0 items-center justify-center rounded-full ${routeType === 2
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-slate-600 text-white'
                                        }`}
                                >
                                    <Train className="size-5" />
                                </span>
                            ) : routeType === 4 ? (
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
                                    <Ship className="size-5" />
                                </span>
                            ) : (
                                <span
                                    className={`flex size-8 shrink-0 items-center justify-center rounded-full ${routeType === 3
                                            ? 'bg-amber-400 text-black'
                                            : 'bg-teal-500 text-black'
                                        }`}
                                >
                                    <Bus className="size-5" />
                                </span>
                            )}
                            <DialogTitle className="text-lg font-semibold">
                                {attrs?.label ?? (isBusy ? 'Memuat...' : '—')}
                            </DialogTitle>
                            <BadgeCustom
                                currentStatus={attrs?.current_status as VehicleCurrentStatus}
                            />
                        </div>
                        {vehicleDetail?.data && (
                            <div className="flex min-h-[20px] items-center gap-1.5 text-sm">
                                {isBusy ? (
                                    <>
                                        <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            Memperbarui data...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="size-2 rounded-full bg-emerald-500" />
                                        <span className="text-emerald-600">
                                            Live Tracking Active
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </DialogHeader>

                {/* Body */}
                <div className="max-h-[70vh] overflow-y-auto">
                    {vehicleDetail?.data ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-6 py-4">
                            {/* Left column */}
                            <div className="flex flex-col gap-4">
                                {/* Informasi Kendaraan */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-emerald-600" />
                                        Informasi Kendaraan
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <DataRow
                                            label="Vehicle ID"
                                            value={vehicleDetail?.data?.id}
                                        />
                                        <DataRow label="Label" value={attrs?.label} />
                                        <DataRow
                                            label="Occupancy"
                                            value={occupancyLabel(attrs?.occupancy_status ?? null)}
                                        />
                                        <DataRow label="Revenue" value={attrs?.revenue} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <DataRow label="Latitude" value={attrs?.latitude} />
                                        <DataRow label="Longitude" value={attrs?.longitude} />
                                        <DataRow
                                            label="Speed"
                                            value={speedKmh != null ? `${speedKmh} km/h` : '—'}
                                        />
                                        <DataRow
                                            label="Bearing"
                                            value={bearingToDirection(attrs?.bearing ?? null)}
                                        />
                                        <DataRow
                                            label="Stop Sequence"
                                            value={attrs?.current_stop_sequence}
                                        />
                                        <DataRow
                                            label="Direction"
                                            value={directionLabel ?? directionId}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="size-4 shrink-0" />
                                        Terakhir diperbarui: {lastUpdatedFormatted}
                                    </div>
                                </div>

                                {/* Informasi Rute */}
                                {routeDetail && (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold flex items-center gap-2">
                                            <Route className="size-4" />
                                            Informasi Rute
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium text-white border-none"
                                                    style={{
                                                        backgroundColor: `#${routeDetail.attributes.color || '000000'}`,
                                                        color: routeDetail.attributes.text_color
                                                            ? `#${routeDetail.attributes.text_color}`
                                                            : undefined,
                                                    }}
                                                >
                                                    {routeDetail.attributes.short_name}
                                                </span>
                                                <span className="text-sm font-medium">
                                                    {routeDetail.attributes.long_name}
                                                </span>
                                            </div>
                                            <DataRow
                                                label="Deskripsi"
                                                value={routeDetail.attributes.description}
                                            />
                                            <DataRow
                                                label="Fare Class"
                                                value={routeDetail.attributes.fare_class}
                                            />
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                    Tujuan per Arah
                                                </p>
                                                <p className="text-sm">
                                                    {routeDetail.attributes.direction_destinations?.join(
                                                        ' ↔ ',
                                                    ) ?? '—'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Informasi Perjalanan (Trip) */}
                                {tripDetail && (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold">
                                            Informasi Perjalanan
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <DataRow label="Trip ID" value={tripDetail.id} />
                                            <DataRow
                                                label="Headsign"
                                                value={tripDetail.attributes.headsign}
                                            />
                                            <DataRow
                                                label="Block ID"
                                                value={tripDetail.attributes.block_id}
                                            />
                                            <DataRow
                                                label="Wheelchair"
                                                value={
                                                    tripDetail.attributes.wheelchair_accessible === 1
                                                        ? 'Ya'
                                                        : tripDetail.attributes.wheelchair_accessible === 2
                                                            ? 'Tidak'
                                                            : '—'
                                                }
                                            />
                                            <DataRow
                                                label="Sepeda Diizinkan"
                                                value={
                                                    tripDetail.attributes.bikes_allowed === 1
                                                        ? 'Ya'
                                                        : tripDetail.attributes.bikes_allowed === 2
                                                            ? 'Tidak'
                                                            : '—'
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right column */}
                            <div className="flex flex-col gap-4">
                                {/* Map */}
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Lokasi Real-Time
                                    </p>
                                    <LeafletMap
                                        className="h-[520px]"
                                        center={mapCenter}
                                        zoom={15}
                                        markers={mapMarkers}
                                        shapeCoordinates={shapeCoordinates}
                                        colorRoute={`#${colorRoute ?? '000000'}`}
                                        schedulePoints={scheduleCoordinates}
                                    />
                                </div>

                                {/* Informasi Halte */}
                                {stopDetail && (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold flex items-center gap-2">
                                            <MapPin className="size-4" />
                                            Informasi Halte Selanjutnya
                                        </h3>
                                        <div className="rounded-lg border p-3 space-y-2">
                                            <DataRow
                                                label="Nama Halte"
                                                value={stopDetail.attributes.name}
                                            />
                                            <DataRow
                                                label="Deskripsi"
                                                value={stopDetail.attributes.description}
                                            />
                                            <DataRow
                                                label="Jalan"
                                                value={stopDetail.attributes.on_street}
                                            />
                                            <DataRow
                                                label="Peron"
                                                value={stopDetail.attributes.platform_name}
                                            />
                                            <DataRow
                                                label="Kotamadya"
                                                value={stopDetail.attributes.municipality}
                                            />
                                            <div className="grid grid-cols-2 gap-3 pt-1">
                                                <DataRow
                                                    label="Lat"
                                                    value={stopDetail.attributes.latitude}
                                                />
                                                <DataRow
                                                    label="Lon"
                                                    value={stopDetail.attributes.longitude}
                                                />
                                            </div>
                                            <DataRow
                                                label="Wheelchair Boarding"
                                                value={
                                                    stopDetail.attributes.wheelchair_boarding === 1
                                                        ? 'Ya'
                                                        : stopDetail.attributes.wheelchair_boarding === 2
                                                            ? 'Tidak'
                                                            : '—'
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <DialogDetailSkeleton />
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="flex flex-row flex-wrap items-center justify-end gap-2 border-t px-6 py-4">
                    <DialogClose asChild>
                        <Button variant="outline" size="sm">
                            Tutup
                        </Button>
                    </DialogClose>
                    <Button
                        size="sm"
                        className="gap-1.5"
                        onClick={onRefresh}
                        disabled={isRefetching}
                    >
                        <RefreshCw
                            className={`size-4 ${isRefetching ? 'animate-spin' : ''}`}
                        />
                        Refresh Data
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
