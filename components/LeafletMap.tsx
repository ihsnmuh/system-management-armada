'use client';

import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import type { LatLngExpression } from 'leaflet';
import type { ComponentType, ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import type {
  MapContainerProps,
  MarkerProps,
  PolylineProps,
  PopupProps,
  TileLayerProps,
} from 'react-leaflet';

const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false },
) as unknown as ComponentType<MapContainerProps>;
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), {
  ssr: false,
}) as unknown as ComponentType<TileLayerProps>;
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), {
  ssr: false,
}) as unknown as ComponentType<MarkerProps>;
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), {
  ssr: false,
}) as unknown as ComponentType<PopupProps>;
const Polyline = dynamic(() => import('react-leaflet').then((m) => m.Polyline), {
  ssr: false,
}) as unknown as ComponentType<PolylineProps>;

export interface LeafletMapMarker {
  id: string;
  position: LatLngExpression;
  popup?: ReactNode;
}

interface LeafletMapProps {
  center?: LatLngExpression | null;
  zoom?: number;
  markers?: LeafletMapMarker[];
  shapeCoordinates?: [number, number][];
  className?: string;
  tileUrl?: string;
  tileAttribution?: string;
}

const DEFAULT_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const DEFAULT_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function LeafletMap({
  center,
  zoom = 13,
  markers,
  shapeCoordinates,
  className,
  tileUrl = DEFAULT_TILE_URL,
  tileAttribution = DEFAULT_TILE_ATTRIBUTION,
}: LeafletMapProps) {
  useEffect(() => {
    // Fix icon marker Leaflet yang sering hilang di bundler (Next/Webpack/Turbopack).
    // Dieksekusi hanya di browser (useEffect) supaya aman dari SSR.
    void (async () => {
      const leafletModule = await import('leaflet');
      const L = (leafletModule.default ?? leafletModule) as typeof import('leaflet');
      const iconRetinaUrl = (await import(
        'leaflet/dist/images/marker-icon-2x.png'
      )) as unknown as { default: string };
      const iconUrl = (await import(
        'leaflet/dist/images/marker-icon.png'
      )) as unknown as { default: string };
      const shadowUrl = (await import(
        'leaflet/dist/images/marker-shadow.png'
      )) as unknown as { default: string };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: iconRetinaUrl.default,
        iconUrl: iconUrl.default,
        shadowUrl: shadowUrl.default,
      });
    })();
  }, []);

  const resolvedMarkers = useMemo(() => {
    if (markers && markers.length > 0) return markers;
    if (!center) return [];
    return [
      {
        id: 'center',
        position: center,
        popup: 'Lokasi saat ini',
      },
    ] satisfies LeafletMapMarker[];
  }, [center, markers]);

  const resolvedShapeCoordinates = useMemo(() => {
    if (shapeCoordinates && shapeCoordinates.length > 0) return shapeCoordinates;
    return [];
  }, [shapeCoordinates]);

  if (!center) {
    return (
      <div
        className={cn(
          'flex h-[400px] w-full items-center justify-center rounded-md border bg-muted/30 text-sm text-muted-foreground',
          className,
        )}
      >
        Lokasi belum tersedia.
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-[400px] w-full overflow-hidden rounded-md border',
        className,
      )}
    >
      <MapContainer center={center} zoom={zoom} className="h-full w-full">
        <TileLayer attribution={tileAttribution} url={tileUrl} />
        {resolvedMarkers.map((m) => (
          <Marker key={m.id} position={m.position}>
            {m.popup ? <Popup>{m.popup}</Popup> : null}
          </Marker>
        ))}
        {resolvedShapeCoordinates.length > 0 && (
          <Polyline pathOptions={{ color: 'blue' }} positions={resolvedShapeCoordinates} />
        )}
      </MapContainer>
    </div>
  );
}

export default LeafletMap;