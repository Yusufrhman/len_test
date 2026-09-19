export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatCoordinate(value: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return value.toFixed(5);
}

export function formatCoordinates(latitude: number, longitude: number): string {
  return `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`;
}
