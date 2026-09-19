import L from "leaflet";
import { cn } from "@/lib/utils";
import { getEntityTypeMeta } from "../../types";

const iconCache = new Map<string, L.DivIcon>();

export function createEntityIcon(
  type: string,
  active = false,
  drop = false,
) {
  const key = `${type}:${active}:${drop}`;
  const cached = iconCache.get(key);

  if (cached) {
    return cached;
  }

  const meta = getEntityTypeMeta(type);

  const icon = L.divIcon({
    className: cn(
      "entity-pin",
      active && "entity-pin--active",
      drop && "entity-pin--drop",
    ),
    html: `<img src="${meta.pin}" alt="" width="34" height="43" />`,
    iconSize: [34, 43],
    iconAnchor: [17, 43],
    popupAnchor: [0, -40],
  });

  iconCache.set(key, icon);

  return icon;
}

export function createPickerIcon() {
  return L.divIcon({
    className: "entity-pin entity-pin--picker",
    html: '<img src="/pins/pin-picker.svg" alt="" width="40" height="50" />',
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -46],
  });
}
