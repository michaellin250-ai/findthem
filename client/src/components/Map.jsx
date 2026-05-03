import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

mapboxgl.accessToken = MAPBOX_TOKEN;

const SOURCE_ID = 'missing-persons';
const CLUSTER_LAYER = 'clusters';
const CLUSTER_COUNT_LAYER = 'cluster-count';
const UNCLUSTERED_LAYER = 'unclustered-point';

// Initial globe view
const GLOBE_START = { center: [-98, 38], zoom: 2, pitch: 20, bearing: 0 };
// Final US overview
const US_VIEW = { center: [-98, 39], zoom: 4, pitch: 30, bearing: 0, duration: 3500 };

function casesToGeoJSON(cases) {
  return {
    type: 'FeatureCollection',
    features: cases
      .filter(c => c.lat != null && c.lng != null)
      .map(c => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
        properties: {
          id: c.id,
          name: c.name,
          age: c.age,
          gender: c.gender,
          dateMissing: c.dateMissing,
          city: c.city,
          county: c.county,
          state: c.state,
          stateFull: c.stateFull,
          photoUrl: c.photoUrl,
          namusUrl: c.namusUrl,
        },
      })),
  };
}

export default function Map({ cases, onCaseSelect, selectedCase }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const initializedRef = useRef(false);
  const flyingRef = useRef(false);

  const addLayers = useCallback((map) => {
    if (map.getSource(SOURCE_ID)) return;

    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: casesToGeoJSON([]),
      cluster: true,
      clusterMaxZoom: 11,
      clusterRadius: 35,
    });

    // Cluster circle
    map.addLayer({
      id: CLUSTER_LAYER,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step', ['get', 'point_count'],
          'rgba(245, 158, 11, 0.85)',
          50, 'rgba(245, 158, 11, 0.9)',
          200, 'rgba(251, 191, 36, 0.95)',
          500, 'rgba(253, 224, 71, 0.97)',
        ],
        'circle-radius': [
          'step', ['get', 'point_count'],
          18, 50, 26, 200, 34, 500, 42,
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': [
          'step', ['get', 'point_count'],
          'rgba(245, 158, 11, 0.5)',
          50, 'rgba(245, 158, 11, 0.5)',
          200, 'rgba(251, 191, 36, 0.5)',
          500, 'rgba(253, 224, 71, 0.5)',
        ],
        'circle-blur': 0.1,
      },
    });

    // Cluster count label
    map.addLayer({
      id: CLUSTER_COUNT_LAYER,
      type: 'symbol',
      source: SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 11,
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': 'rgba(0,0,0,0.4)',
        'text-halo-width': 0.5,
      },
    });

    // Individual pin — outer glow ring
    map.addLayer({
      id: 'unclustered-glow',
      type: 'circle',
      source: SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': 9,
        'circle-color': 'rgba(245, 158, 11, 0.15)',
        'circle-stroke-width': 0,
      },
    });

    // Individual pin — main dot
    map.addLayer({
      id: UNCLUSTERED_LAYER,
      type: 'circle',
      source: SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          5, 4,
          10, 7,
          14, 9,
        ],
        'circle-color': '#F59E0B',
        'circle-stroke-width': 1.5,
        'circle-stroke-color': 'rgba(255, 255, 255, 0.6)',
        'circle-opacity': 0.92,
      },
    });

    // Highlighted pin (selected)
    map.addLayer({
      id: 'unclustered-selected',
      type: 'circle',
      source: SOURCE_ID,
      filter: ['==', ['get', 'id'], ''],
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          5, 6,
          10, 10,
          14, 13,
        ],
        'circle-color': '#FBBF24',
        'circle-stroke-width': 2.5,
        'circle-stroke-color': 'rgba(255, 255, 255, 0.9)',
      },
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return;
    initializedRef.current = true;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      ...GLOBE_START,
      projection: 'globe',
      antialias: true,
    });

    mapRef.current = map;

    // Atmospheric glow on globe
    map.on('style.load', () => {
      map.setFog({
        color: 'rgb(10, 10, 20)',
        'high-color': 'rgb(20, 20, 50)',
        'horizon-blend': 0.04,
        'space-color': 'rgb(5, 5, 15)',
        'star-intensity': 0.6,
      });

      addLayers(map);

      // Cinematic intro: fly from globe to continental US
      setTimeout(() => {
        if (!flyingRef.current) {
          flyingRef.current = true;
          map.flyTo({
            ...US_VIEW,
            essential: true,
          });
        }
      }, 800);
    });

    // Cluster click → zoom in
    map.on('click', CLUSTER_LAYER, (e) => {
      e.originalEvent.stopPropagation();
      const features = map.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER] });
      if (!features.length) return;
      const clusterId = features[0].properties.cluster_id;
      map.getSource(SOURCE_ID).getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom + 0.5,
          duration: 600,
        });
      });
    });

    // Individual pin click
    map.on('click', UNCLUSTERED_LAYER, (e) => {
      e.originalEvent.stopPropagation();
      const f = e.features[0];
      if (!f) return;
      const props = f.properties;
      onCaseSelect({
        id: props.id,
        name: props.name,
        age: props.age,
        gender: props.gender,
        dateMissing: props.dateMissing,
        city: props.city,
        county: props.county,
        state: props.state,
        stateFull: props.stateFull,
        photoUrl: props.photoUrl,
        namusUrl: props.namusUrl,
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
      });
    });

    // Hover cursors
    map.on('mouseenter', CLUSTER_LAYER, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', CLUSTER_LAYER, () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseenter', UNCLUSTERED_LAYER, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', UNCLUSTERED_LAYER, () => { map.getCanvas().style.cursor = ''; });

    // Navigation controls
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    return () => {
      map.remove();
      mapRef.current = null;
      initializedRef.current = false;
      flyingRef.current = false;
    };
  }, []);

  // Update GeoJSON when cases change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const update = () => {
      const source = map.getSource(SOURCE_ID);
      if (source) {
        source.setData(casesToGeoJSON(cases));
      }
    };

    if (map.isStyleLoaded()) {
      update();
    } else {
      map.once('style.load', update);
    }
  }, [cases]);

  // Highlight selected pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const id = selectedCase?.id || '';
    if (map.getLayer('unclustered-selected')) {
      map.setFilter('unclustered-selected', ['==', ['get', 'id'], id]);
    }
  }, [selectedCase]);

  // Fly to selected case
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedCase?.lat || !selectedCase?.lng) return;
    map.flyTo({
      center: [selectedCase.lng, selectedCase.lat],
      zoom: Math.max(map.getZoom(), 10),
      duration: 1200,
      essential: true,
    });
  }, [selectedCase?.id]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ background: '#0a0a14' }}
    />
  );
}
