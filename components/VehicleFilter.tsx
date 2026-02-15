'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InfiniteFilterDropdown from '@/components/InfiniteFilterDropdown';
import { useRoutesInfinite } from '@/hooks/queries/use-routes';
import { useTripsInfinite } from '@/hooks/queries/use-trips';

const ROUTE_LOAD_MORE_SENTINEL = '__LOAD_MORE_ROUTES__';
const TRIP_LOAD_MORE_SENTINEL = '__LOAD_MORE_TRIPS__';

const PAGE_SIZE = 20;

const VehicleFilter = () => {
  const routeLoadMoreRef = useRef<HTMLDivElement>(null);
  const tripLoadMoreRef = useRef<HTMLDivElement>(null);
  const [routeSearchValue, setRouteSearchValue] = useState('');
  const [tripSearchValue, setTripSearchValue] = useState('');

  const {
    routes,
    fetchNextPage: fetchNextRoutePage,
    hasNextPage: hasNextRoutePage,
    isFetchingNextPage: isFetchingNextRoutePage,
    isLoading: isRoutesLoading,
  } = useRoutesInfinite(PAGE_SIZE);

  const {
    trips,
    fetchNextPage: fetchNextTripPage,
    hasNextPage: hasNextTripPage,
    isFetchingNextPage: isFetchingNextTripPage,
    isLoading: isTripsLoading,
  } = useTripsInfinite(PAGE_SIZE);

  const routeOptions = useMemo(
    () => routes.map((r) => r.attributes.long_name),
    [routes],
  );

  const tripOptions = useMemo(
    () =>
      trips.map(
        (t) =>
          t.attributes.headsign ||
          t.attributes.name ||
          t.id,
      ),
    [trips],
  );

  const filteredRouteItems = useMemo(() => {
    const q = routeSearchValue.trim().toLowerCase();
    const filtered = q
      ? routeOptions.filter((label) =>
          label.toLowerCase().includes(q),
        )
      : routeOptions;
    if (hasNextRoutePage) return [...filtered, ROUTE_LOAD_MORE_SENTINEL];
    return filtered;
  }, [routeOptions, routeSearchValue, hasNextRoutePage]);

  const filteredTripItems = useMemo(() => {
    const q = tripSearchValue.trim().toLowerCase();
    const filtered = q
      ? tripOptions.filter((label) =>
          label.toLowerCase().includes(q),
        )
      : tripOptions;
    if (hasNextTripPage) return [...filtered, TRIP_LOAD_MORE_SENTINEL];
    return filtered;
  }, [tripOptions, tripSearchValue, hasNextTripPage]);

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
            onLoadMore={fetchNextTripPage}
          />

          <div className="flex shrink-0 items-center gap-2">
            <Button size="default" className="gap-2">
              <Filter className="size-4" />
              Terapkan Filter
            </Button>
            <Button variant="secondary" size="default">
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleFilter;
