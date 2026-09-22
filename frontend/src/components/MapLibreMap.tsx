'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Incident } from '@/lib/types';
import { useTheme } from '@/context/ThemeContext';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapLibreMapProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (inc: Incident) => void;
}

export default function MapLibreMap({
  incidents,
  selectedIncident,
  onSelectIncident,
}: MapLibreMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const { theme } = useTheme();
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      // Use standard OpenStreetMap raster tiles
      const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

      const mapStyle = {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [tileUrl],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      };

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: mapStyle as any,
        center: [77.6245, 12.9352], // Bengaluru ORR Silk Board
        zoom: 12.5,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

      map.on('load', () => {
        if (!isMounted) return;
        setMapLoaded(true);

        // Add ORR Corridor Line
        map.addSource('orr-corridor', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: { name: '500-D Outer Ring Road Artery' },
            geometry: {
              type: 'LineString',
              coordinates: [
                [77.6245, 12.9176], // Silk Board
                [77.6358, 12.9220], // HSR Layout
                [77.6740, 12.9250], // Bellandur
                [77.6980, 12.9370], // Marathahalli
                [77.7010, 12.9900], // KR Puram
                [77.6800, 13.0100], // Tin Factory
                [77.5910, 13.0350], // Hebbal
              ],
            },
          },
        });

        map.addLayer({
          id: 'orr-corridor-line',
          type: 'line',
          source: 'orr-corridor',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#00F5D4',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });
      });

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [theme]);

  // Update Markers on Incidents Change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    incidents.forEach((inc) => {
      const el = document.createElement('div');
      const isSelected = selectedIncident?.id === inc.id;
      const isCritical = inc.priority_level === 'P1_CRITICAL';

      el.className = `cursor-pointer transition-all duration-200 transform ${
        isSelected ? 'scale-125 z-50 ring-4 ring-cyan-400 rounded-full' : 'hover:scale-110 z-10'
      }`;

      el.innerHTML = `
        <div style="
          width: ${isSelected ? '24px' : '18px'};
          height: ${isSelected ? '24px' : '18px'};
          background-color: ${isCritical ? '#EF4444' : '#F59E0B'};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 0 10px ${isCritical ? 'rgba(239,68,68,0.8)' : 'rgba(245,158,11,0.8)'};
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="font-size: 9px; color: white; font-weight: bold; font-family: monospace;">
            ${inc.priority_level === 'P1_CRITICAL' ? '!' : '•'}
          </span>
        </div>
      `;

      el.addEventListener('click', () => {
        onSelectIncident(inc);
      });

      const popup = new maplibregl.Popup({ offset: 15 }).setHTML(`
        <div style="font-family: sans-serif; padding: 4px; font-size: 11px;">
          <div style="font-weight: bold; color: ${isCritical ? '#DC2626' : '#D97706'}">
            ${inc.id} • ${inc.priority_level}
          </div>
          <div style="margin-top: 2px; color: #374151;">${inc.title}</div>
          <div style="margin-top: 2px; font-size: 10px; color: #6B7280;">
            Score: ${inc.priority.toFixed(0)} • Conf: ${(inc.evidence_conf * 100).toFixed(0)}%
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([inc.lon, inc.lat])
        .setPopup(popup)
        .addTo(mapInstanceRef.current);

      markersRef.current.push(marker);
    });
  }, [incidents, selectedIncident, mapLoaded, onSelectIncident]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Real-time Map Attribution & Mode Indicator */}
      <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-950/85 backdrop-blur border border-stone-300 dark:border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-gray-700 dark:text-gray-300 shadow-sm pointer-events-none">
        <span className="text-teal-600 dark:text-teal-400 font-bold">MAPLIBRE GL</span> • EPSG:4326 OpenStreetMap Vector/Raster Mesh
      </div>
    </div>
  );
}
