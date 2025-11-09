/**
 * Navigation Laws - Wayfinding, celestial navigation, mapmaking
 */

export const CelestialNavigation = {
  latitude FromStar: (starAltitude_deg: number) => starAltitude_deg,
  longitudeFromTime: (localNoon_hours: number, referenceLongitude_deg: number) => {
    return referenceLongitude_deg + (localNoon_hours - 12) * 15;
  },
  starPositionError_deg: (eyeAccuracy_arcmin: number) => eyeAccuracy_arcmin / 60,
};

export const Cartography = {
  mapAccuracy: (surveyingTech: number) => Math.min(1, surveyingTech / 100),
  distortionFromProjection: (latitude_deg: number, projection: string) => {
    if (projection === 'mercator') return Math.tan(latitude_deg * Math.PI / 180);
    return 0.1;
  },
};

export const NavigationLaws = {
  celestial: CelestialNavigation,
  cartography: Cartography,
} as const;

