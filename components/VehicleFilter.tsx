'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InfiniteFilterDropdown, {
  type FilterOption,
} from '@/components/InfiniteFilterDropdown';
import { useRoutesInfinite } from '@/hooks/queries/use-routes';
import { useTripsInfinite } from '@/hooks/queries/use-trips';
import type { Trip } from '@/types/api';

const ROUTE_LOAD_MORE_SENTINEL = '__LOAD_MORE_ROUTES__';
const TRIP_LOAD_MORE_SENTINEL = '__LOAD_MORE_TRIPS__';

const PAGE_SIZE = 20;

export interface VehicleFilterApplyPayload {
  routeIds: string[];
  tripIds: string[];
}

/** Format tampilan trip: satu baris informatif — Headsign - Rute / nama jadwal (ID). */
function TripOptionLabel({
  trip,
  routeLongName,
}: {
  trip: Trip;
  routeLongName: string;
}) {
  const headsign = trip.attributes.headsign ?? trip.attributes.name ?? trip.id;
  const suffix = trip.attributes.name
    ? trip.attributes.name
    : routeLongName
      ? `${routeLongName} (${trip.id})`
      : trip.id;
  const line = `${headsign} - ${suffix}`;
  return <span className="block min-w-0 truncate text-left">{line}</span>;
}

export interface VehicleFilterProps {
  onApplyFilter?: (payload: VehicleFilterApplyPayload) => void;
  onReset?: () => void;
}

const VehicleFilter = ({ onApplyFilter, onReset }: VehicleFilterProps) => {
  const routeLoadMoreRef = useRef<HTMLDivElement>(null);
  const tripLoadMoreRef = useRef<HTMLDivElement>(null);
  const [routeSearchValue, setRouteSearchValue] = useState('');
  const [tripSearchValue, setTripSearchValue] = useState('');
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([]);
  const [selectedTripIds, setSelectedTripIds] = useState<string[]>([]);

  const handleApply = () => {
    onApplyFilter?.({
      routeIds: selectedRouteIds,
      tripIds: selectedTripIds,
    });
  };

  const handleReset = () => {
    setSelectedRouteIds([]);
    setSelectedTripIds([]);
    setRouteSearchValue('');
    setTripSearchValue('');
    onReset?.();
  };

  const {
    routes,
    fetchNextPage: fetchNextRoutePage,
    hasNextPage: hasNextRoutePage,
    isFetchingNextPage: isFetchingNextRoutePage,
    isLoading: isRoutesLoading,
  } = useRoutesInfinite(PAGE_SIZE);

  const tripFilterRoute =
    selectedRouteIds.length > 0 ? selectedRouteIds.join(',') : undefined;

  const {
    trips,
    fetchNextPage: fetchNextTripPage,
    hasNextPage: hasNextTripPage,
    isFetchingNextPage: isFetchingNextTripPage,
    isLoading: isTripsLoading,
  } = useTripsInfinite(
    PAGE_SIZE,
    tripFilterRoute
      ? { filterRoute: tripFilterRoute }
      : undefined,
    { enabled: !!tripFilterRoute },
  );

  const routeOptions = useMemo<FilterOption[]>(
    () =>
      routes.map((r) => ({
        value: r.id,
        label: r.attributes.long_name,
        searchText: r.attributes.long_name,
      })),
    [routes],
  );

  const tripOptions = useMemo<FilterOption[]>(
    () =>
      trips.map((t) => {
        const routeId = t.relationships?.route?.data?.id;
        const routeLongName =
          (routeId && routes.find((r) => r.id === routeId)?.attributes.long_name) ?? '';
        const headsign = t.attributes.headsign ?? t.attributes.name ?? t.id;
        const line2 =
          t.attributes.name ??
          (routeLongName ? `${routeLongName} (${t.id})` : t.id);
        const searchText = [headsign, line2, t.id].join(' ').toLowerCase();
        return {
          value: t.id,
          label: (
            <TripOptionLabel
              trip={t}
              routeLongName={routeLongName}
            />
          ),
          searchText,
        };
      }),
    [trips, routes],
  );

  const filteredRouteItems = useMemo(() => {
    const q = routeSearchValue.trim().toLowerCase();
    const filtered = q
      ? routeOptions
          .filter((o) => (o.searchText ?? String(o.label)).toLowerCase().includes(q))
          .map((o) => o.value)
      : routeOptions.map((o) => o.value);
    if (hasNextRoutePage) return [...filtered, ROUTE_LOAD_MORE_SENTINEL];
    return filtered;
  }, [routeOptions, routeSearchValue, hasNextRoutePage]);

  const filteredTripItems = useMemo(() => {
    const q = tripSearchValue.trim().toLowerCase();
    const filtered = q
      ? tripOptions
          .filter((o) => (o.searchText ?? String(o.label)).toLowerCase().includes(q))
          .map((o) => o.value)
      : tripOptions.map((o) => o.value);
    if (hasNextTripPage) return [...filtered, TRIP_LOAD_MORE_SENTINEL];
    return filtered;
  }, [tripOptions, tripSearchValue, hasNextTripPage]);

  const handleRouteValueChange = (value: string[]) => {
    setSelectedRouteIds(value);
    setSelectedTripIds([]);
  };

  // Saat search tidak menemukan hasil di data yang sudah dimuat, fetch halaman berikutnya
  useEffect(() => {
    if (
      routeSearchValue.trim() &&
      filteredRouteItems.filter((i) => i !== ROUTE_LOAD_MORE_SENTINEL)
        .length === 0 &&
      hasNextRoutePage &&
      !isFetchingNextRoutePage
    ) {
      fetchNextRoutePage();
    }
  }, [
    routeSearchValue,
    filteredRouteItems,
    hasNextRoutePage,
    isFetchingNextRoutePage,
    fetchNextRoutePage,
  ]);

  useEffect(() => {
    if (
      tripSearchValue.trim() &&
      filteredTripItems.filter((i) => i !== TRIP_LOAD_MORE_SENTINEL)
        .length === 0 &&
      hasNextTripPage &&
      !isFetchingNextTripPage
    ) {
      fetchNextTripPage();
    }
  }, [
    tripSearchValue,
    filteredTripItems,
    hasNextTripPage,
    isFetchingNextTripPage,
    fetchNextTripPage,
  ]);

  return (
    <Card>
      <CardContent>
        <div className="flex flex-wrap items-end gap-4">
          <InfiniteFilterDropdown
            label="Rute"
            placeholder="Cari rute…"
            options={routeOptions}
            filteredItems={filteredRouteItems}
            searchValue={routeSearchValue}
            onSearchChange={setRouteSearchValue}
            hasNextPage={hasNextRoutePage}
            isFetchingNextPage={isFetchingNextRoutePage}
            isLoading={isRoutesLoading}
            loadMoreRef={routeLoadMoreRef}
            sentinelValue={ROUTE_LOAD_MORE_SENTINEL}
            value={selectedRouteIds}
            onValueChange={handleRouteValueChange}
            onLoadMore={fetchNextRoutePage}
          />

          <InfiniteFilterDropdown
            label="Trip"
            placeholder="Cari trip…"
            options={tripOptions}
            filteredItems={filteredTripItems}
            searchValue={tripSearchValue}
            onSearchChange={setTripSearchValue}
            hasNextPage={hasNextTripPage}
            isFetchingNextPage={isFetchingNextTripPage}
            isLoading={isTripsLoading}
            loadMoreRef={tripLoadMoreRef}
            sentinelValue={TRIP_LOAD_MORE_SENTINEL}
            value={selectedTripIds}
            onValueChange={setSelectedTripIds}
            disabled={!tripFilterRoute}
            onLoadMore={fetchNextTripPage}
          />

          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="default"
              className="gap-2"
              onClick={handleApply}
              type="button"
            >
              <Filter className="size-4" />
              Terapkan Filter
            </Button>
            <Button
              variant="secondary"
              size="default"
              onClick={handleReset}
              type="button"
            >
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleFilter;
