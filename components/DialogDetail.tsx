'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Vehicle } from '@/types/api/vehicles';
import { VehicleCurrentStatus } from '@/types/api/vehicles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bus, CheckCircle2, Clock, History, Phone, RefreshCw } from 'lucide-react';

const STATUS_CONFIG: Record<
  VehicleCurrentStatus,
  { label: string; badgeClass: string }
> = {
  [VehicleCurrentStatus.IN_TRANSIT_TO]: {
    label: 'IN TRANSIT',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  [VehicleCurrentStatus.STOPPED_AT]: {
    label: 'STOPPED',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  [VehicleCurrentStatus.INCOMING_AT]: {
    label: 'AT TERMINAL',
    badgeClass: 'bg-blue-100 text-blue-800 border-amber-200',
  },
};

function bearingToDirection(bearing: number | null): string {
  if (bearing === null) return '—';
  const d = bearing % 360;
  if (d < 22.5 || d >= 337.5) return `${Math.round(bearing)}° (N)`;
  if (d < 67.5) return `${Math.round(bearing)}° (NE)`;
  if (d < 112.5) return `${Math.round(bearing)}° (E)`;
  if (d < 157.5) return `${Math.round(bearing)}° (SE)`;
  if (d < 202.5) return `${Math.round(bearing)}° (S)`;
  if (d < 247.5) return `${Math.round(bearing)}° (SW)`;
  if (d < 292.5) return `${Math.round(bearing)}° (W)`;
  return `${Math.round(bearing)}° (NW)`;
}

interface DialogDetailProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId?: string;
  vehicleDetail?: Vehicle | null;
  isLoading: boolean;
  isFetching: boolean;
  isRefetching: boolean;
  onRefresh?: () => void;
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

  const statusInfo = vehicleDetail
    ? STATUS_CONFIG[vehicleDetail.attributes.current_status] ?? {
        label: 'UNKNOWN',
        badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
      }
    : null;

  const updatedAt = vehicleDetail?.attributes?.updated_at;
  const lastUpdatedFormatted = updatedAt
    ? new Date(updatedAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }) + ' WIB'
    : '—';

  const speedKmh =
    vehicleDetail?.attributes.speed != null
      ? Math.round(vehicleDetail.attributes.speed * 3.6)
      : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl gap-0 p-0">
        {/* Header */}
        <DialogHeader className="flex flex-row items-start justify-between gap-4 border-b px-6 py-4 text-left">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Bus className="size-5 text-blue-600" />
              <DialogTitle className="text-lg font-semibold">
                {vehicleDetail?.attributes?.label ?? (isBusy ? 'Memuat...' : '—')}
              </DialogTitle>
              {statusInfo && (
                <Badge
                  variant="outline"
                  className={statusInfo.badgeClass + ' font-medium'}
                >
                  {statusInfo.label}
                </Badge>
              )}
            </div>
            {!isBusy && (
              <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                <span className="size-2 rounded-full bg-emerald-500" />
                Live Tracking Active
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Body: two columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-6 py-4">
          {isBusy && (
            <div className="col-span-full py-8 text-center text-muted-foreground text-sm">
              Memuat detail kendaraan...
            </div>
          )}
          {!isBusy && (
            <>
          {/* Left column — vehicle data */}
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border bg-emerald-50/80 p-3 flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-medium text-emerald-800">
                Beroperasi Normal
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Latitude
              </p>
              <p className="text-sm font-mono">
                {vehicleDetail?.attributes?.latitude ?? '—'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Longitude
              </p>
              <p className="text-sm font-mono">
                {vehicleDetail?.attributes?.longitude ?? '—'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Route Data
              </p>
              <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                {vehicleDetail?.relationships?.route?.data?.id
                  ? `Route ${vehicleDetail.relationships.route.data.id}`
                  : '—'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Trip ID
                </p>
                <p className="text-sm font-mono">
                  {vehicleDetail?.relationships?.trip?.data?.id ?? '—'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Speed
                </p>
                <p className="text-sm">
                  {speedKmh != null ? `${speedKmh} km/h` : '—'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Bearing
                </p>
                <p className="text-sm">
                  {bearingToDirection(vehicleDetail?.attributes?.bearing ?? null)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Sequence
                </p>
                <p className="text-sm">
                  {vehicleDetail?.attributes?.current_stop_sequence ?? '—'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4 shrink-0" />
              {lastUpdatedFormatted}
            </div>
          </div>

          {/* Right column — map placeholder (kosong) */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Lokasi Real-Time
            </p>
            <div className="min-h-[240px] rounded-lg border border-dashed bg-muted/30" />
          </div>
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex flex-row flex-wrap items-center justify-end gap-2 border-t px-6 py-4">
          <Button variant="outline" size="sm" className="gap-1.5">
            <History className="size-4" />
            Riwayat Perjalanan
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Phone className="size-4" />
            Hubungi Driver
          </Button>
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
