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

/** GTFS route_type: 0=Light Rail, 1=Heavy Rail, 2=Commuter Rail, 3=Bus, 4=Ferry */
const ROUTE_TYPE_LABEL: Record<number, string> = {
  0: 'Light Rail',
  1: 'Heavy Rail',
  2: 'Commuter Rail',
  3: 'Bus',
  4: 'Ferry',
};

/** Warna badge per tipe — mengikuti palet resmi MBTA (Green/Red/Orange/Blue Line, Commuter Rail, Bus, Ferry) */
const ROUTE_TYPE_COLOR: Record<number, { bg: string; text: string }> = {
  0: { bg: '#00843D', text: '#ffffff' }, // Light Rail — Green Line
  1: { bg: '#DA291C', text: '#ffffff' }, // Heavy Rail — Red Line
  2: { bg: '#80276C', text: '#ffffff' }, // Commuter Rail — ungu MBTA
  3: { bg: '#FFC72C', text: '#000000' }, // Bus — gold MBTA (teks gelap untuk kontras)
  4: { bg: '#008EAA', text: '#ffffff' }, // Ferry — teal MBTA
};

const ROUTE_TYPE_OPTIONS: FilterOption[] = [
  { value: '0', label: 'Light Rail', searchText: 'light rail' },
  { value: '1', label: 'Heavy Rail', searchText: 'heavy rail' },
  { value: '2', label: 'Commuter Rail', searchText: 'commuter rail' },
  { value: '3', label: 'Bus', searchText: 'bus' },
  { value: '4', label: 'Ferry', searchText: 'ferry' },
].map((opt) => {
  const typeNum = Number(opt.value);
  const colors = ROUTE_TYPE_COLOR[typeNum] ?? { bg: '#6b7280', text: '#ffffff' };
  return {
    ...opt,
    label: (
      <span className="flex min-w-0 items-center gap-1.5 text-left">
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
          style={{
            backgroundColor: colors.bg,
            color: colors.text,
          }}
        >
          {opt.label}
        </span>
      </span>
    ),
  };
});

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

const TYPE_LOAD_MORE_SENTINEL = '__LOAD_MORE_TYPE__';

const VehicleFilter = ({ onApplyFilter, onReset }: VehicleFilterProps) => {
  const typeLoadMoreRef = useRef<HTMLDivElement>(null);
  const routeLoadMoreRef = useRef<HTMLDivElement>(null);
  const tripLoadMoreRef = useRef<HTMLDivElement>(null);
  const [typeSearchValue, setTypeSearchValue] = useState('');
  const [routeSearchValue, setRouteSearchValue] = useState('');
  const [tripSearchValue, setTripSearchValue] = useState('');
  const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>([]);
  const [selectedRouteIds, setSelectedRouteIds] = useState<string[]>([]);
  const [selectedTripIds, setSelectedTripIds] = useState<string[]>([]);

  const handleApply = () => {
    onApplyFilter?.({
      routeIds: selectedRouteIds,
      tripIds: selectedTripIds,
    });
  };

  const handleReset = () => {
    setSelectedTypeIds([]);
    setSelectedRouteIds([]);
    setSelectedTripIds([]);
    setTypeSearchValue('');
    setRouteSearchValue('');
    setTripSearchValue('');
    onReset?.();
  };

  const routeFilterType =
    selectedTypeIds.length > 0 ? selectedTypeIds.join(',') : undefined;

  const {
    routes,
    fetchNextPage: fetchNextRoutePage,
    hasNextPage: hasNextRoutePage,
    isFetchingNextPage: isFetchingNextRoutePage,
    isLoading: isRoutesLoading,
  } = useRoutesInfinite(
    PAGE_SIZE,
    routeFilterType ? { filterType: routeFilterType } : undefined,
    { enabled: !!routeFilterType },
  );

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
      routes.map((r) => {
        const typeName =
          ROUTE_TYPE_LABEL[r.attributes.type] ?? `Tipe ${r.attributes.type}`;
        const bgColor = r.attributes.color?.startsWith('#')
          ? r.attributes.color
          : `#${r.attributes.color}`;
        const textColor = r.attributes.text_color?.startsWith('#')
          ? r.attributes.text_color
          : `#${r.attributes.text_color ?? 'ffffff'}`;
        return {
          value: r.id,
          label: (
            <span className="flex min-w-0 items-center gap-1.5 text-left">
              <span className="truncate">{r.attributes.long_name}</span>
              <span
                className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: bgColor,
                  color: textColor,
                }}
              >
                {typeName}
              </span>
            </span>
          ),
          searchText: `${r.attributes.long_name} ${typeName}`.toLowerCase(),
        };
      }),
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

  const filteredTypeItems = useMemo(() => {
    const q = typeSearchValue.trim().toLowerCase();
    return q
      ? ROUTE_TYPE_OPTIONS.filter((o) =>
          (o.searchText ?? String(o.label)).toLowerCase().includes(q),
        ).map((o) => o.value)
      : ROUTE_TYPE_OPTIONS.map((o) => o.value);
  }, [typeSearchValue]);

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

  const handleTypeValueChange = (value: string[]) => {
    setSelectedTypeIds(value);
    setSelectedRouteIds([]);
    setSelectedTripIds([]);
  };

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
            label="Tipe Kendaraan"
            placeholder="Cari tipe kendaraan..."
            options={ROUTE_TYPE_OPTIONS}
            filteredItems={filteredTypeItems}
            searchValue={typeSearchValue}
            onSearchChange={setTypeSearchValue}
            hasNextPage={false}
            isFetchingNextPage={false}
            isLoading={false}
            loadMoreRef={typeLoadMoreRef}
            sentinelValue={TYPE_LOAD_MORE_SENTINEL}
            value={selectedTypeIds}
            onValueChange={handleTypeValueChange}
            onLoadMore={() => {}}
          />

          <InfiniteFilterDropdown
            label="Rute"
            placeholder="Cari rute..."
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
            disabled={!routeFilterType}
            onLoadMore={fetchNextRoutePage}
          />

          <InfiniteFilterDropdown
            label="Trip"
            placeholder="Cari trip..."
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
              className="gap-2 cursor-pointer"
              onClick={handleApply}
              type="button"
              disabled={
                selectedRouteIds.length === 0 && selectedTripIds.length === 0
              }
            >
              <Filter className="size-4" />
              Terapkan Filter
            </Button>
            <Button
              variant="secondary"
              size="default"
              className="cursor-pointer"
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
