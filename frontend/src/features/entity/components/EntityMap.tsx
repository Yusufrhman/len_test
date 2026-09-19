import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";
import {
  getEntityStatusMeta,
  getEntityTypeMeta,
  type Entity,
} from "../types";
import { createEntityIcon } from "./map/entity-icon";
import { MapController } from "./map/MapController";
import {
  MAP_ATTRIBUTION,
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_TILE_URL,
} from "./map/map-config";

interface EntityMapProps {
  entities: Entity[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

export function EntityMap({
  entities,
  selectedId,
  onSelect,
  className,
}: EntityMapProps) {
  return (
    <MapContainer
      center={MAP_DEFAULT_CENTER}
      zoom={MAP_DEFAULT_ZOOM}
      zoomControl={false}
      scrollWheelZoom
      className={cn("h-full w-full", className)}
    >
      <TileLayer url={MAP_TILE_URL} attribution={MAP_ATTRIBUTION} />
      <ZoomControl position="bottomright" />
      <MapController entities={entities} selectedId={selectedId} />

      {entities.map((entity) => {
        const typeMeta = getEntityTypeMeta(entity.type);
        const statusMeta = getEntityStatusMeta(entity.status);

        return (
          <Marker
            key={entity.id}
            position={[entity.latitude, entity.longitude]}
            icon={createEntityIcon(entity.type, selectedId === entity.id)}
            eventHandlers={{ click: () => onSelect(entity.id) }}
          >
            <Popup>
              <div className="min-w-[180px] space-y-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {entity.name}
                  </p>
                  <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                    {typeMeta.label}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span
                    className={cn("size-2 rounded-full", statusMeta.dot)}
                  />
                  {statusMeta.label}
                </div>
                <p className="font-mono text-[11px] text-slate-500">
                  {entity.latitude.toFixed(5)}, {entity.longitude.toFixed(5)}
                </p>
                <button
                  type="button"
                  onClick={() => onSelect(entity.id)}
                  className="w-full rounded-md bg-teal-700 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-teal-800"
                >
                  Open details
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
