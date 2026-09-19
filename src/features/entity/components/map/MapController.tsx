import { useEffect, useRef } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { MAP_FOCUSED_ZOOM } from "./map-config";
import type { Entity } from "../../types";

interface MapControllerProps {
  entities: Entity[];
  selectedId?: string | null;
}

export function MapController({ entities, selectedId }: MapControllerProps) {
  const map = useMap();
  const lastFitKey = useRef("");
  const lastSelectedId = useRef<string | null>(null);

  const fitKey = entities
    .map((entity) => `${entity.id}:${entity.latitude}:${entity.longitude}`)
    .join("|");

  useEffect(() => {
    if (entities.length === 0 || lastFitKey.current === fitKey) {
      return;
    }

    lastFitKey.current = fitKey;

    const points = entities.map(
      (entity) => [entity.latitude, entity.longitude] as [number, number],
    );
    const bounds = L.latLngBounds(points);

    if (entities.length === 1) {
      map.flyTo(bounds.getCenter(), Math.max(map.getZoom(), MAP_FOCUSED_ZOOM), {
        duration: 0.6,
      });
      return;
    }

    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 14 });
  }, [entities, fitKey, map]);

  useEffect(() => {
    if (!selectedId || lastSelectedId.current === selectedId) {
      return;
    }

    const selected = entities.find((entity) => entity.id === selectedId);

    if (!selected) {
      return;
    }

    lastSelectedId.current = selectedId;
    map.flyTo(
      [selected.latitude, selected.longitude],
      Math.max(map.getZoom(), MAP_FOCUSED_ZOOM),
      { duration: 0.6 },
    );
  }, [entities, map, selectedId]);

  return null;
}
