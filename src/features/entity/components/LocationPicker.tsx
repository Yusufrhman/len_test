import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { createPickerIcon } from "./map/entity-icon";
import {
  MAP_ATTRIBUTION,
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_FOCUSED_ZOOM,
  MAP_TILE_URL,
} from "./map/map-config";

const pickerIcon = createPickerIcon();

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (coordinates: Coordinates) => void;
  onLocateError?: (message: string) => void;
  className?: string;
}

function ClickToPick({ onChange }: { onChange: (coords: Coordinates) => void }) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}

function FocusMarker({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (latitude === null || longitude === null) {
      return;
    }

    map.flyTo([latitude, longitude], Math.max(map.getZoom(), MAP_FOCUSED_ZOOM), {
      duration: 0.5,
    });
  }, [latitude, longitude, map]);

  return null;
}

export function LocationPicker({
  latitude,
  longitude,
  onChange,
  onLocateError,
  className,
}: LocationPickerProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const hasPosition = latitude !== null && longitude !== null;

  const handleLocate = () => {
    if (!navigator.geolocation) {
      onLocateError?.("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        };

        onChange(coordinates);
        mapRef.current?.flyTo(
          [coordinates.latitude, coordinates.longitude],
          MAP_FOCUSED_ZOOM,
          { duration: 0.6 },
        );
      },
      () => {
        onLocateError?.("Unable to retrieve your current location.");
      },
      { enableHighAccuracy: true, timeout: 8_000 },
    );
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-slate-200 bg-slate-200",
        className,
      )}
    >
      <MapContainer
        ref={mapRef}
        center={
          hasPosition
            ? [latitude as number, longitude as number]
            : MAP_DEFAULT_CENTER
        }
        zoom={hasPosition ? MAP_FOCUSED_ZOOM : MAP_DEFAULT_ZOOM}
        zoomControl={false}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer url={MAP_TILE_URL} attribution={MAP_ATTRIBUTION} />
        <ClickToPick onChange={onChange} />
        <FocusMarker latitude={latitude} longitude={longitude} />

        {hasPosition ? (
          <Marker
            position={[latitude as number, longitude as number]}
            icon={pickerIcon}
            draggable
            eventHandlers={{
              dragend(event) {
                const position = event.target.getLatLng();
                onChange({
                  latitude: Number(position.lat.toFixed(6)),
                  longitude: Number(position.lng.toFixed(6)),
                });
              },
            }}
          />
        ) : null}
      </MapContainer>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] flex items-start justify-between gap-2 p-3">
        <span className="pointer-events-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/95 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm backdrop-blur">
          <MousePointerClick className="size-3.5 text-teal-700" />
          Click the map or drag the pin
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="pointer-events-auto bg-white/95 shadow-sm backdrop-blur"
          onClick={handleLocate}
        >
          <Crosshair className="size-3.5" />
          Locate
        </Button>
      </div>
    </div>
  );
}
