export interface CongestionZone {
  name: string;
  city: "addis_ababa" | "gondar" | "all";
  bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  activeWindows: Array<{
    days: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    startHour: number; // e.g. 7.5 for 07:30
    endHour: number;   // e.g. 9.5 for 09:30
    delayMultiplier: number; // e.g. 1.8x travel time
  }>;
}

export const KNOWN_CONGESTION_ZONES: CongestionZone[] = [
  // Addis Ababa - Meskel Square & Bole Corridor
  {
    name: "Meskel Square / Bole Corridor",
    city: "addis_ababa",
    bbox: { minLat: 8.980, maxLat: 9.020, minLng: 38.750, maxLng: 38.785 },
    activeWindows: [
      { days: [1, 2, 3, 4, 5], startHour: 7.5, endHour: 9.5, delayMultiplier: 1.8 },
      { days: [1, 2, 3, 4, 5], startHour: 17.0, endHour: 19.5, delayMultiplier: 2.1 },
    ],
  },
  // Addis Ababa - Gotera Interchange / Kera
  {
    name: "Gotera Interchange",
    city: "addis_ababa",
    bbox: { minLat: 8.975, maxLat: 8.995, minLng: 38.745, maxLng: 38.765 },
    activeWindows: [
      { days: [1, 2, 3, 4, 5], startHour: 8.0, endHour: 9.5, delayMultiplier: 2.0 },
      { days: [1, 2, 3, 4, 5], startHour: 17.0, endHour: 19.0, delayMultiplier: 2.2 },
    ],
  },
  // Addis Ababa - Megenagna Roundabout
  {
    name: "Megenagna Hub",
    city: "addis_ababa",
    bbox: { minLat: 9.015, maxLat: 9.030, minLng: 38.795, maxLng: 38.815 },
    activeWindows: [
      { days: [1, 2, 3, 4, 5], startHour: 7.5, endHour: 9.5, delayMultiplier: 1.9 },
      { days: [1, 2, 3, 4, 5], startHour: 17.0, endHour: 19.5, delayMultiplier: 2.0 },
    ],
  },
  // Gondar - Arada Saturday Market & Piassa
  {
    name: "Gondar Arada Market & Piassa",
    city: "gondar",
    bbox: { minLat: 12.602, maxLat: 12.615, minLng: 37.460, maxLng: 37.475 },
    activeWindows: [
      { days: [6], startHour: 8.5, endHour: 15.5, delayMultiplier: 2.2 }, // Saturday Market Peak
      { days: [1, 2, 3, 4, 5], startHour: 12.0, endHour: 14.0, delayMultiplier: 1.4 },
    ],
  },
];

export function getActiveTrafficMultiplier(
  coordinates: [number, number][],
  currentTime: Date = new Date(),
): { multiplier: number; zoneName?: string } {
  const currentDay = currentTime.getDay();
  const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;

  let maxMultiplier = 1.0;
  let activeZoneName: string | undefined;

  for (const zone of KNOWN_CONGESTION_ZONES) {
    const isIntersecting = coordinates.some(
      ([lng, lat]) =>
        lat >= zone.bbox.minLat &&
        lat <= zone.bbox.maxLat &&
        lng >= zone.bbox.minLng &&
        lng <= zone.bbox.maxLng,
    );

    if (isIntersecting) {
      for (const win of zone.activeWindows) {
        if (
          win.days.includes(currentDay) &&
          currentHour >= win.startHour &&
          currentHour <= win.endHour
        ) {
          if (win.delayMultiplier > maxMultiplier) {
            maxMultiplier = win.delayMultiplier;
            activeZoneName = zone.name;
          }
        }
      }
    }
  }

  return { multiplier: maxMultiplier, zoneName: activeZoneName };
}
