export const ENTITY_TYPES = ["vehicle", "iot_device", "facility"] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export const ENTITY_STATUSES = ["active", "inactive", "maintenance"] as const;

export type EntityStatus = (typeof ENTITY_STATUSES)[number];

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  status: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityRequest {
  name: string;
  type: EntityType;
  status: string;
  latitude: number;
  longitude: number;
}

export type UpdateEntityRequest = CreateEntityRequest;

export interface EntityFilters {
  type?: EntityType;
  status?: string;
}

export interface EntityTypeMeta {
  value: EntityType;
  label: string;
  shortLabel: string;
  description: string;
  pin: string;
  accent: string;
  chip: string;
  dot: string;
}

export const ENTITY_TYPE_META: Record<EntityType, EntityTypeMeta> = {
  vehicle: {
    value: "vehicle",
    label: "Vehicle",
    shortLabel: "VEH",
    description: "Fleet units and moving assets",
    pin: "/pins/pin-vehicle.svg",
    accent: "#2563eb",
    chip: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  iot_device: {
    value: "iot_device",
    label: "IoT Device",
    shortLabel: "IOT",
    description: "Connected sensors and trackers",
    pin: "/pins/pin-iot_device.svg",
    accent: "#ea580c",
    chip: "border-orange-200 bg-orange-50 text-orange-700",
    dot: "bg-orange-500",
  },
  facility: {
    value: "facility",
    label: "Facility",
    shortLabel: "FAC",
    description: "Sites, depots and installations",
    pin: "/pins/pin-facility.svg",
    accent: "#0f766e",
    chip: "border-teal-200 bg-teal-50 text-teal-700",
    dot: "bg-teal-600",
  },
};

export interface EntityStatusMeta {
  label: string;
  chip: string;
  dot: string;
}

export const ENTITY_STATUS_META: Record<string, EntityStatusMeta> = {
  active: {
    label: "Active",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  inactive: {
    label: "Inactive",
    chip: "border-slate-200 bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  },
  maintenance: {
    label: "Maintenance",
    chip: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
};

export function getEntityTypeMeta(type: string): EntityTypeMeta {
  return ENTITY_TYPE_META[type as EntityType] ?? ENTITY_TYPE_META.facility;
}

export function getEntityStatusMeta(status: string): EntityStatusMeta {
  return ENTITY_STATUS_META[status] ?? ENTITY_STATUS_META.inactive;
}
