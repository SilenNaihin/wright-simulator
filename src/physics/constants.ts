// Physical constants
export const PHYSICS = {
  // Gravitational acceleration (m/s²)
  GRAVITY: 9.81,

  // Standard air density at sea level (kg/m³)
  AIR_DENSITY_SEA_LEVEL: 1.225,

  // Temperature lapse rate (K/m)
  TEMP_LAPSE_RATE: 0.0065,

  // Sea level temperature (K)
  SEA_LEVEL_TEMP: 288.15,

  // Gas constant for air (J/(kg·K))
  GAS_CONSTANT: 287.05,
} as const

// Conversion factors
export const CONVERSIONS = {
  DEG_TO_RAD: Math.PI / 180,
  RAD_TO_DEG: 180 / Math.PI,
  KTS_TO_MS: 0.514444,
  MS_TO_KTS: 1.94384,
  FT_TO_M: 0.3048,
  M_TO_FT: 3.28084,
  HP_TO_W: 745.7,
  W_TO_HP: 1 / 745.7,
} as const
