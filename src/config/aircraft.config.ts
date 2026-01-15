// Wright Flyer 1903 Specifications
// Based on historical data from Smithsonian and NASA research

export const WRIGHT_FLYER_SPECS = {
  // Dimensions (meters)
  wingspan: 12.3,           // 40.3 feet
  wingArea: 47.4,           // square meters (510 sq ft)
  chordLength: 1.98,        // meters
  aspectRatio: 3.2,         // wingspan^2 / wingArea

  // Mass (kg) - Historical: 605 lb empty + 145 lb Orville = 750 lb = 340 kg
  emptyWeight: 274,         // 605 lb
  pilotWeight: 66,          // 145 lb (Orville's actual weight)
  totalMass: 340,           // kg (historical gross weight)

  // Engine specifications
  enginePower: 8950,        // watts (12 hp)
  propellerDiameter: 2.6,   // meters (8.5 feet)
  propellerEfficiency: 0.66,// The Wright's achieved about 66% efficiency
  maxRPM: 450,              // Maximum engine RPM
  idleRPM: 100,             // Idle RPM

  // Aerodynamic coefficients
  // CL0 reduced further to limit excess climb during canonical flight
  liftCoefficient0: 0.1,    // CL at zero angle of attack (reduced for controllability)
  liftCoefficientSlope: 5.5,// dCL/d(alpha) per radian
  maxLiftCoefficient: 1.2,  // Maximum CL before stall
  stallAngle: 0.26,         // ~15 degrees in radians

  dragCoefficient0: 0.040,  // Parasitic drag coefficient (CD0) - calibrated for flight (research: 0.047)
  oswaldEfficiency: 0.85,   // Oswald span efficiency factor - Wright's achieved good efficiency

  // Control surface effectiveness (moment coefficient per radian of deflection)
  elevatorEffectiveness: 1.5,  // Increased for better pitch control
  rudderEffectiveness: 0.6,
  wingWarpEffectiveness: 0.5,

  // Control surface areas (m²)
  elevatorArea: 4.6,        // Front canard area
  rudderArea: 1.9,          // Rear rudder area

  // Moments of inertia (kg*m²) - estimated
  Ixx: 1200,  // Roll moment of inertia
  Iyy: 1800,  // Pitch moment of inertia
  Izz: 2400,  // Yaw moment of inertia

  // Center of gravity position from nose (meters)
  cgPosition: 1.8,

  // Control surface deflection limits (radians)
  maxElevatorDeflection: 0.35,  // ~20 degrees
  maxRudderDeflection: 0.52,    // ~30 degrees
  maxWingWarp: 0.17,            // ~10 degrees
} as const

export const SIMULATION_CONSTANTS = {
  gravity: 9.81,            // m/s²
  airDensitySeaLevel: 1.225,// kg/m³ at sea level, 15°C
  timeStep: 1 / 60,         // 60 FPS physics update
  maxDataPoints: 500,       // Chart data history length
} as const

// Initial pitch angle for takeoff
// Start at trim AoA for level flight (~4.3 degrees with CL0=0.1)
const INITIAL_PITCH = 0.075 // Trim angle of attack for level flight

// Headwind speed (Wright Brothers had 27 mph headwind on Dec 17, 1903)
export const HEADWIND_SPEED = 12 // m/s headwind (27 mph historical)

// Launch rail height: 2x4 lumber laid flat = 3.5 inches = 0.089m
// The Wright Brothers used four 15-foot 2x4s joined together (60 ft total)
// Rail was placed directly on the sand at Kill Devil Hills
export const LAUNCH_RAIL_HEIGHT = 0.089 // 3.5 inches in meters

// Ground level (sand surface at Kill Devil Hills)
export const GROUND_LEVEL = 0 // Sand surface

export const INITIAL_AIRCRAFT_STATE = {
  position: { x: 0, y: LAUNCH_RAIL_HEIGHT, z: 0 },
  velocity: { x: 0, y: 0, z: -4 }, // Initial ground velocity from launch rail
  // Quaternion for pitch up: rotation around Y axis (lateral axis)
  orientation: {
    x: 0,
    y: Math.sin(INITIAL_PITCH / 2),
    z: 0,
    w: Math.cos(INITIAL_PITCH / 2)
  },
  angularVelocity: { x: 0, y: 0, z: 0 },
  engineRPM: 380, // Engine warmed up and ready
  throttle: 0,
} as const
