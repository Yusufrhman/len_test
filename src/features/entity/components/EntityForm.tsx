import { useState, type FormEvent } from "react";
import { AlertCircle, Save } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/toast-context";
import type { FieldErrors, NormalizedApiError } from "@/lib/api-error";
import { cn, formatCoordinates } from "@/lib/utils";
import { LocationPicker } from "./LocationPicker";
import {
  ENTITY_STATUSES,
  ENTITY_TYPES,
  ENTITY_TYPE_META,
  getEntityStatusMeta,
  type CreateEntityRequest,
  type Entity,
  type EntityType,
} from "../types";

const entityFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "name is required")
    .max(120, "name must be at most 120 characters"),
  type: z.enum(ENTITY_TYPES),
  status: z.string().min(1, "status is required"),
  latitude: z
    .number()
    .min(-90, "latitude must be between -90 and 90")
    .max(90, "latitude must be between -90 and 90"),
  longitude: z
    .number()
    .min(-180, "longitude must be between -180 and 180")
    .max(180, "longitude must be between -180 and 180"),
});

interface FormValues {
  name: string;
  type: EntityType;
  status: string;
  latitude: number | null;
  longitude: number | null;
}

interface EntityFormProps {
  mode: "create" | "edit";
  initialEntity?: Entity;
  isSubmitting: boolean;
  serverError: NormalizedApiError | null;
  onSubmit: (values: CreateEntityRequest) => void;
  onCancel: () => void;
}

function toInitialValues(entity?: Entity): FormValues {
  if (entity) {
    return {
      name: entity.name,
      type: entity.type,
      status: entity.status,
      latitude: entity.latitude,
      longitude: entity.longitude,
    };
  }

  return {
    name: "",
    type: "vehicle",
    status: "active",
    latitude: null,
    longitude: null,
  };
}

export function EntityForm({
  mode,
  initialEntity,
  isSubmitting,
  serverError,
  onSubmit,
  onCancel,
}: EntityFormProps) {
  const { toast } = useToast();
  const [values, setValues] = useState<FormValues>(() =>
    toInitialValues(initialEntity),
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  const hasLocation = values.latitude !== null && values.longitude !== null;

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key as string]) {
        return current;
      }

      const next = { ...current };
      delete next[key as string];
      return next;
    });
  }

  const fieldError = (field: string) => errors[field] ?? serverError?.fields?.[field];

  const generalError =
    serverError && Object.keys(serverError.fields ?? {}).length === 0
      ? serverError
      : null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FieldErrors = {};

    if (values.latitude === null || values.longitude === null) {
      nextErrors.latitude = "Pick a location on the map";
    }

    const result = entityFormSchema.safeParse({
      name: values.name,
      type: values.type,
      status: values.status,
      latitude: values.latitude ?? 0,
      longitude: values.longitude ?? 0,
    });

    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    onSubmit({
      name: values.name.trim(),
      type: values.type,
      status: values.status,
      latitude: values.latitude as number,
      longitude: values.longitude as number,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid items-start gap-6 lg:grid-cols-2"
    >
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        {generalError ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
            <div>
              <p className="text-xs font-semibold text-red-700">
                {generalError.code === "NETWORK_ERROR"
                  ? "Cannot reach the server"
                  : "Something went wrong"}
              </p>
              <p className="mt-0.5 text-xs text-red-600">
                {generalError.message}
              </p>
            </div>
          </div>
        ) : null}

        <Field
          label="Name"
          htmlFor="entity-name"
          required
          error={fieldError("name")}
          hint="Human readable label"
        >
          <Input
            id="entity-name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="e.g. Vehicle 001"
            invalid={Boolean(fieldError("name"))}
            autoFocus
            autoComplete="off"
          />
        </Field>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <label className="text-xs font-semibold tracking-wide text-slate-700">
              Type<span className="ml-0.5 text-red-500">*</span>
            </label>
            <span className="text-[11px] text-slate-400">
              Category of entity
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ENTITY_TYPES.map((type) => {
              const meta = ENTITY_TYPE_META[type];
              const active = values.type === type;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => update("type", type)}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all focus-visible:ring-2 focus-visible:ring-teal-600/40 focus-visible:outline-none",
                    active
                      ? "border-teal-500 bg-teal-50/70 ring-1 ring-teal-500/20"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <img src={meta.pin} alt="" className="size-6" />
                  <span className="text-xs leading-tight font-semibold text-slate-700">
                    {meta.label}
                  </span>
                </button>
              );
            })}
          </div>
          {fieldError("type") ? (
            <p className="text-xs font-medium text-red-600">
              {fieldError("type")}
            </p>
          ) : null}
        </div>

        <Field
          label="Status"
          htmlFor="entity-status"
          required
          error={fieldError("status")}
        >
          <Select
            id="entity-status"
            value={values.status}
            onChange={(event) => update("status", event.target.value)}
            invalid={Boolean(fieldError("status"))}
          >
            {ENTITY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {getEntityStatusMeta(status).label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="submit" loading={isSubmitting}>
            <Save className="size-4" />
            {mode === "create" ? "Create entity" : "Save changes"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-slate-700">
              Location<span className="ml-0.5 text-red-500">*</span>
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Set the coordinates by picking a point on the map.
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-500">
            {hasLocation
              ? formatCoordinates(
                  values.latitude as number,
                  values.longitude as number,
                )
              : "Not set"}
          </span>
        </div>

        <LocationPicker
          latitude={values.latitude}
          longitude={values.longitude}
          onChange={({ latitude, longitude }) => {
            setValues((current) => ({ ...current, latitude, longitude }));
            setErrors((current) => {
              if (!current.latitude && !current.longitude) {
                return current;
              }

              const next = { ...current };
              delete next.latitude;
              delete next.longitude;
              return next;
            });
          }}
          onLocateError={(message) =>
            toast({ tone: "error", title: "Location error", description: message })
          }
          className="h-[300px] sm:h-[360px] lg:h-[440px]"
        />

        {fieldError("latitude") ?? fieldError("longitude") ? (
          <p className="text-xs font-medium text-red-600">
            {fieldError("latitude") ?? fieldError("longitude")}
          </p>
        ) : null}
      </div>
    </form>
  );
}
