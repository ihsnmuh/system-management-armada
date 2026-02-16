import polyline from '@mapbox/polyline';

export const decodeMBTAPolyline = (encodedString: string) => {
  if (!encodedString) return [];

  // polyline.decode menghasilkan array [[lat, lng], [lat, lng], ...]
  const decodedCoordinates = polyline.decode(encodedString);

  return decodedCoordinates;
};
