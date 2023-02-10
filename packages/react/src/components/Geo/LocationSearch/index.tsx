import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import {
  MaplibreGeocoderOptions,
  MaplibreGeocoderResults,
  MaplibreGeocoderResult,
} from 'maplibre-gl-geocoder';
import { createAmplifyGeocoder } from 'maplibre-gl-js-amplify';
import { useControl, useMap } from 'react-map-gl';
import type { IControl } from 'react-map-gl';

const LOCATION_SEARCH_OPTIONS = {
  maplibregl,
  marker: { color: '#3FB1CE' },
  popup: true,
  showResultMarkers: { color: '#3FB1CE' },
  showResultsWhileTyping: true,
};

const LOCATION_SEARCH_CONTAINER = 'geocoder-container';

interface LocationSearchProps extends MaplibreGeocoderOptions {
  /**
   * Emitted when the input is cleared
   */
  onClear?: () => void;
  /**
   * Emitted when the geocoder is looking up a query
   */
  onLoading?: (query: string) => void;
  /**
   * Fired when the geocoder returns a response
   */
  onResults?: (results: MaplibreGeocoderResults) => void;
  /**
   * Fired when input is set
   */
  onResult?: (result: MaplibreGeocoderResult) => void;
  /**
   * Emitted on error as string
   */
  onError?: (error: string) => void;
}

type EventType = 'clear' | 'loading' | 'result' | 'results' | 'error';

type AmplifyLocationSearch = IControl & {
  addTo: (container: string) => void;
  on: (eventType: EventType, callback: (event) => void) => void;
  off: (eventType: EventType, callback: (event) => void) => void;
};

const LocationSearchControl = ({
  position = 'top-right',
  ...props
}: LocationSearchProps) => {
  useControl(
    () => createAmplifyGeocoder(props) as unknown as AmplifyLocationSearch,
    {
      position,
    }
  );

  return null;
};

const LocationSearchStandalone = ({
  onLoading,
  onResult,
  onResults,
  onClear,
  onError,
  ...props
}: LocationSearchProps) => {
  const geocoderRef = useRef(null);

  useEffect(() => {
    const map = createAmplifyGeocoder(
      props
    ) as unknown as AmplifyLocationSearch;
    geocoderRef.current = map;

    map.addTo(`#${LOCATION_SEARCH_CONTAINER}`);

    map.on('result', onResult);
    map.on('loading', onLoading);
    map.on('results', onResults);
    map.on('clear', onClear);
    map.on('error', onError);

    return () => {
      map.off('result', onResult);
      map.off('loading', onLoading);
      map.off('results', onResults);
      map.off('clear', onClear);
      map.off('error', onError);
    };
  }, [onResult, onLoading, onResults, onClear, onError, props]);

  return <div id={LOCATION_SEARCH_CONTAINER} ref={geocoderRef} />;
};

/**
 * The `<LocationSearch>` component provides location search.
 *
 * [📖 Docs](https://ui.docs.amplify.aws/react/connected-components/geo#location-search)
 *
 * @example
 * // Used as a map control:
 * function App() {
 *   return (
 *     <MapView>
 *       <LocationSearch />
 *     </MapView>
 *   );
 * }
 *
 * @example
 * // Used as a standalone component:
 * function App() {
 *   return <LocationSearch />;
 * }
 */
export const LocationSearch = (props: LocationSearchProps): JSX.Element => {
  const { current: map } = useMap();

  /**
   * This logic determines whether the LocationSearch exists as part of a Map component or if it is a standalone component.
   * The `useControl` hook inside `LocationSearchControl` from `react-map-gl` makes it easy to add a control to a map,
   * but throws an error if that map doesn't exist. If the map doesn't exist, the LocationSearch is mounted to a container
   * upon rendering inside the `LocationSearchStandalone`.
   */
  if (map) {
    return <LocationSearchControl {...LOCATION_SEARCH_OPTIONS} {...props} />;
  }

  return <LocationSearchStandalone {...LOCATION_SEARCH_OPTIONS} {...props} />;
};

export const Geocoder = LocationSearch;
