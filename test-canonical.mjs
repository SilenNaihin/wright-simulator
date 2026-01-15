#!/usr/bin/env node
// Deterministic test of canonical flight - mirrors FlightDynamics.ts exactly
// Run with: node test-canonical.mjs

// ============ CONSTANTS (from constants.ts and aircraft.config.ts) ============
const PHYSICS = {
  GRAVITY: 9.81,
  AIR_DENSITY_SEA_LEVEL: 1.225,
  TEMP_LAPSE_RATE: 0.0065,
  SEA_LEVEL_TEMP: 288.15,
  GAS_CONSTANT: 287.05,
};

const SPECS = {
  wingspan: 12.3,
  wingArea: 47.4,
  chordLength: 1.98,
  aspectRatio: 3.2,
  totalMass: 340,
  enginePower: 8950,
  propellerDiameter: 2.6,
  maxRPM: 450,
  idleRPM: 100,
  liftCoefficient0: 0.1,
  liftCoefficientSlope: 5.5,
  maxLiftCoefficient: 1.2,
  stallAngle: 0.26,
  dragCoefficient0: 0.040,
  oswaldEfficiency: 0.85,
  elevatorEffectiveness: 1.5,
  rudderEffectiveness: 0.6,
  elevatorArea: 4.6,
  rudderArea: 1.9,
  Ixx: 1200,
  Iyy: 1800,
  Izz: 2400,
  cgPosition: 1.8,
  maxElevatorDeflection: 0.35,
  maxRudderDeflection: 0.52,
  maxWingWarp: 0.17,
};

const HEADWIND_SPEED = 12; // m/s

// Wright Brothers used 2x4 lumber for the launch rail
// 2x4 actual dimensions: 3.5 inches = 0.089m
// The rail was laid flat on the sand at Kill Devil Hills
const LAUNCH_RAIL_HEIGHT = 0.089; // 3.5 inches in meters
const GROUND_LEVEL = 0; // Sand surface

const INITIAL_PITCH = 0.075;

// ============ HELPER FUNCTIONS ============
function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function smoothstep(t) {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}

// ============ CANONICAL CONTROLS (from simulationStore.ts) ============
function getCanonicalControls(time) {
  const duration = 12;
  const t = time / duration;

  // Throttle curve - tuned for 36.5m distance at ~34 FPS
  // Maintain power through landing for elevator authority
  let throttle;
  if (t < 0.10) {
    throttle = 0.92;
  } else if (t < 0.25) {
    const u = smoothstep((t - 0.10) / 0.15);
    throttle = lerp(0.92, 0.87, u);
  } else if (t < 0.95) {
    throttle = 0.87;  // Slightly reduced cruise power for 36.5m distance
  } else {
    const u = smoothstep((t - 0.95) / 0.05);
    throttle = lerp(0.87, 0.70, u);  // Very slight power reduction at touchdown
  }

  // Elevator profile - tuned for 3m max altitude from rail height (0.089m)
  // Historical: ~10 ft (3m) max altitude, smooth glide to land on sand at 12s
  // Goal: smooth controlled descent, level/nose-up pitch at touchdown
  let elevator;
  if (t < 0.12) {
    elevator = 0.016;  // Nose-up for takeoff
  } else if (t < 0.27) {
    const u = smoothstep((t - 0.12) / 0.15);
    elevator = lerp(0.016, -0.009, u);
  } else if (t < 0.50) {
    elevator = -0.009;  // Slight nose-down for cruise (limit climb to ~3m)
  } else if (t < 0.64) {
    // Begin descent - gradual transition
    const u = smoothstep((t - 0.50) / 0.14);
    elevator = lerp(-0.009, -0.060, u);
  } else if (t < 0.70) {
    // Steady descent - nose-down
    elevator = -0.060;
  } else if (t < 0.82) {
    // First flare - level out
    const u = smoothstep((t - 0.70) / 0.12);
    elevator = lerp(-0.060, 0.020, u);
  } else {
    // Final flare - strong nose-up for landing
    const u = smoothstep((t - 0.82) / 0.18);
    elevator = lerp(0.020, 0.070, u);  // Very strong nose-up
  }

  return {
    throttle: Math.max(0, Math.min(1, throttle)),
    elevator: Math.max(-1, Math.min(1, elevator)),
    rudder: 0,
    wingWarp: 0,
  };
}

// ============ AERODYNAMICS (from AerodynamicsEngine.ts) ============
function calculateLiftCoefficient(aoa) {
  if (Math.abs(aoa) < SPECS.stallAngle) {
    const cl = SPECS.liftCoefficient0 + SPECS.liftCoefficientSlope * aoa;
    return Math.min(cl, SPECS.maxLiftCoefficient);
  }
  const sign = Math.sign(aoa);
  const excess = Math.abs(aoa) - SPECS.stallAngle;
  return sign * SPECS.maxLiftCoefficient * Math.exp(-excess * 3);
}

function calculateDragCoefficient(cl) {
  const inducedFactor = 1 / (Math.PI * SPECS.aspectRatio * SPECS.oswaldEfficiency);
  return SPECS.dragCoefficient0 + cl * cl * inducedFactor;
}

function calculateLift(velocity, aoa, airDensity) {
  if (velocity < 0.1) return 0;
  const cl = calculateLiftCoefficient(aoa);
  const q = 0.5 * airDensity * velocity * velocity;
  return q * SPECS.wingArea * cl;
}

function calculateDrag(velocity, cl, airDensity) {
  if (velocity < 0.1) return 0;
  const cd = calculateDragCoefficient(cl);
  const q = 0.5 * airDensity * velocity * velocity;
  return q * SPECS.wingArea * cd;
}

function calculateAirDensity(altitude) {
  const T = PHYSICS.SEA_LEVEL_TEMP - PHYSICS.TEMP_LAPSE_RATE * altitude;
  const pressure = 101325 * Math.pow(T / PHYSICS.SEA_LEVEL_TEMP, 5.257);
  return pressure / (PHYSICS.GAS_CONSTANT * T);
}

// ============ ENGINE (from EngineModel.ts) ============
function calculatePropellerEfficiency(velocity, rpm) {
  if (rpm < 10) return 0.3;
  const n = rpm / 60;
  const J = velocity / (n * SPECS.propellerDiameter);
  const Jopt = 0.8;
  const deviation = (J - Jopt) / 0.5;
  return 0.40 + 0.44 * Math.exp(-deviation * deviation);
}

function calculatePower(throttle, rpm) {
  const norm = rpm / SPECS.maxRPM;
  const factor = norm * (2 - norm);
  return throttle * SPECS.enginePower * factor;
}

function calculateThrust(throttle, rpm, velocity) {
  if (throttle < 0.01 || rpm < 10) return 0;
  const power = calculatePower(throttle, rpm);
  const efficiency = calculatePropellerEfficiency(velocity, rpm);
  const minVel = 3.0;

  if (velocity < minVel) {
    const staticThrust = 600 * (power / SPECS.enginePower);
    const blend = velocity / minVel;
    const dynamicThrust = efficiency * power / minVel;
    return staticThrust * (1 - blend) + dynamicThrust * blend;
  }
  return efficiency * power / velocity;
}

function calculateRPMResponse(throttle, currentRPM, dt) {
  const targetRPM = SPECS.idleRPM + throttle * (SPECS.maxRPM - SPECS.idleRPM);
  const tau = currentRPM < targetRPM ? 0.8 : 0.5;
  const alpha = 1 - Math.exp(-dt / tau);
  return currentRPM + (targetRPM - currentRPM) * alpha;
}

// ============ CONTROL SURFACES (from ControlSurfaces.ts) ============
function calculatePitchMoment(elevator, velocity, airDensity) {
  if (velocity < 0.5) return 0;
  const deflectionRad = elevator * SPECS.maxElevatorDeflection;
  const q = 0.5 * airDensity * velocity * velocity;
  return q * SPECS.elevatorArea * SPECS.elevatorEffectiveness * deflectionRad * SPECS.cgPosition;
}

// ============ QUATERNION HELPERS ============
function getPitchFromQuaternion(q) {
  const sinp = 2 * (q.w * q.y - q.z * q.x);
  return Math.abs(sinp) >= 1 ? Math.sign(sinp) * Math.PI / 2 : Math.asin(sinp);
}

function getYawFromQuaternion(q) {
  const siny_cosp = 2 * (q.w * q.z + q.x * q.y);
  const cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
  return Math.atan2(siny_cosp, cosy_cosp);
}

function integrateQuaternion(q, omega, dt) {
  const halfDt = dt * 0.5;
  const qDot = {
    x: halfDt * (omega.x * q.w + omega.z * q.y - omega.y * q.z),
    y: halfDt * (omega.y * q.w - omega.z * q.x + omega.x * q.z),
    z: halfDt * (omega.z * q.w + omega.y * q.x - omega.x * q.y),
    w: halfDt * (-omega.x * q.x - omega.y * q.y - omega.z * q.z),
  };
  const newQ = { x: q.x + qDot.x, y: q.y + qDot.y, z: q.z + qDot.z, w: q.w + qDot.w };
  const mag = Math.sqrt(newQ.x**2 + newQ.y**2 + newQ.z**2 + newQ.w**2);
  return { x: newQ.x/mag, y: newQ.y/mag, z: newQ.z/mag, w: newQ.w/mag };
}

// ============ PHYSICS INTEGRATION (from FlightDynamics.ts) ============
function integrate(state, controls, dt) {
  // Update RPM
  const newRPM = calculateRPMResponse(controls.throttle, state.rpm, dt);

  // Airspeed (includes headwind)
  const effectiveVz = state.vz - HEADWIND_SPEED;
  const airspeed = Math.sqrt(state.vx**2 + state.vy**2 + effectiveVz**2);

  // Air density
  const airDensity = calculateAirDensity(Math.max(0, state.y));

  // Pitch and yaw from orientation
  const pitch = getPitchFromQuaternion(state.orientation);
  const yaw = getYawFromQuaternion(state.orientation);

  // Angle of attack
  let aoa = 0;
  if (airspeed > 0.5) {
    const horizontalAirspeed = Math.sqrt(state.vx**2 + effectiveVz**2);
    const flightPathAngle = Math.atan2(state.vy, horizontalAirspeed);
    aoa = pitch - flightPathAngle;
  }

  // Forces
  const lift = calculateLift(airspeed, aoa, airDensity);
  const liftCoeff = calculateLiftCoefficient(aoa);
  const drag = calculateDrag(airspeed, liftCoeff, airDensity);
  const thrust = calculateThrust(controls.throttle, newRPM, airspeed);
  const weight = SPECS.totalMass * PHYSICS.GRAVITY;

  // Direction vectors
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);

  // Forward direction in world space
  const forwardX = -sinYaw * cosPitch;
  const forwardY = sinPitch;
  const forwardZ = -cosYaw * cosPitch;

  // Force components
  let Fx = thrust * forwardX;
  let Fy = thrust * forwardY - weight;
  let Fz = thrust * forwardZ;

  // Add lift (vertical)
  if (airspeed > 0.5) {
    Fy += lift * cosPitch;
  }

  // Add drag (opposite to air-relative velocity)
  if (airspeed > 0.5) {
    const dragFactor = drag / airspeed;
    Fx -= state.vx * dragFactor;
    Fy -= state.vy * dragFactor;
    Fz -= effectiveVz * dragFactor;
  }

  // Accelerations
  let ax = Fx / SPECS.totalMass;
  let ay = Fy / SPECS.totalMass;
  let az = Fz / SPECS.totalMass;

  // Ground interaction
  const GROUND_CHECK = 0.8;
  const onGround = state.y <= GROUND_CHECK;
  if (onGround) {
    const groundSpeed = Math.sqrt(state.vx**2 + state.vz**2);
    if (groundSpeed > 0.1) {
      const normalForce = Math.max(0, weight - lift);
      const friction = 0.02 * normalForce;
      ax -= (state.vx / groundSpeed) * friction / SPECS.totalMass;
      az -= (state.vz / groundSpeed) * friction / SPECS.totalMass;
    }
    if (lift < weight && state.vy < 0) {
      ay = Math.max(0, ay);
    }
  }

  // Pitch moment
  const pitchMoment = calculatePitchMoment(controls.elevator, airspeed, airDensity);
  const pitchDamping = -state.angularVelY * 150;
  const trimAoA = 0.075;
  const stabilityCoeff = 30;
  const pitchStability = -(aoa - trimAoA) * stabilityCoeff * (airspeed / 15);
  const alphaPitch = (pitchMoment + pitchDamping + pitchStability) / SPECS.Iyy;

  // Damping
  const linearDamping = 0.9995;
  const angularDamping = 0.998;

  // Integrate velocities
  let newVx = (state.vx + ax * dt) * linearDamping;
  let newVy = (state.vy + ay * dt) * linearDamping;
  let newVz = (state.vz + az * dt) * linearDamping;

  // Integrate position
  let newX = state.x + newVx * dt;
  let newY = Math.max(GROUND_LEVEL, state.y + newVy * dt);
  let newZ = state.z + newVz * dt;

  // Ground collision
  if (newY <= GROUND_LEVEL && newVy < 0) {
    newY = GROUND_LEVEL;
    newVy = 0;
    // Ground friction on touchdown
    newVx *= 0.85;
    newVz *= 0.85;
  }

  // Angular velocity
  let newAngularVelY = (state.angularVelY + alphaPitch * dt) * angularDamping;
  newAngularVelY = Math.max(-1, Math.min(1, newAngularVelY));

  // Update orientation
  const newOrientation = integrateQuaternion(
    state.orientation,
    { x: 0, y: newAngularVelY, z: 0 },
    dt
  );

  return {
    x: newX, y: newY, z: newZ,
    vx: newVx, vy: newVy, vz: newVz,
    orientation: newOrientation,
    angularVelY: newAngularVelY,
    rpm: newRPM,
  };
}

// ============ SIMULATION ============
function simulate(fps = 60) {
  const dt = 1/fps;
  console.log(`Running at ${fps} FPS (dt = ${(dt*1000).toFixed(2)}ms)\n`);

  // Initial state (from aircraft.config.ts)
  // Start on launch rail: 3.5 inches (0.089m) above sand
  let state = {
    x: 0, y: LAUNCH_RAIL_HEIGHT, z: 0,
    vx: 0, vy: 0, vz: -4,
    orientation: {
      x: 0,
      y: Math.sin(INITIAL_PITCH / 2),
      z: 0,
      w: Math.cos(INITIAL_PITCH / 2),
    },
    angularVelY: 0,
    rpm: 380,
  };

  let time = 0;
  let distance = 0;
  let maxAlt = state.y;
  let wasAirborne = false;
  let lastX = state.x, lastZ = state.z;

  console.log('=== CANONICAL FLIGHT TEST (Browser Physics) ===\n');
  console.log('Target: 12s, 36.5m, max 3m above sand, land at 0m (sand)\n');
  console.log('Time  | Alt   | Dist  | GndSpd | AirSpd | Pitch | Throt | Elev');
  console.log('------|-------|-------|--------|--------|-------|-------|------');

  while (time < 14) {
    const ctrl = getCanonicalControls(time);
    state = integrate(state, ctrl, dt);

    // Distance traveled
    const dx = state.x - lastX;
    const dz = state.z - lastZ;
    distance += Math.sqrt(dx*dx + dz*dz);
    lastX = state.x;
    lastZ = state.z;

    maxAlt = Math.max(maxAlt, state.y);
    if (state.y > LAUNCH_RAIL_HEIGHT + 1.0) wasAirborne = true; // At least 1m above rail

    // Log every second
    if (Math.abs(time - Math.round(time)) < dt) {
      const pitch = getPitchFromQuaternion(state.orientation);
      const groundSpeed = Math.sqrt(state.vx**2 + state.vz**2);
      const effectiveVz = state.vz - HEADWIND_SPEED;
      const airspeed = Math.sqrt(state.vx**2 + state.vy**2 + effectiveVz**2);
      const airDensity = calculateAirDensity(Math.max(0, state.y));

      // Calculate AoA
      let aoa = 0;
      if (airspeed > 0.5) {
        const horizontalAirspeed = Math.sqrt(state.vx**2 + effectiveVz**2);
        const flightPathAngle = Math.atan2(state.vy, horizontalAirspeed);
        aoa = pitch - flightPathAngle;
      }

      // Calculate forces for debugging
      const lift = calculateLift(airspeed, aoa, airDensity);
      const liftCoeff = calculateLiftCoefficient(aoa);
      const drag = calculateDrag(airspeed, liftCoeff, airDensity);
      const thrust = calculateThrust(ctrl.throttle, state.rpm, airspeed);
      const weight = SPECS.totalMass * PHYSICS.GRAVITY;

      console.log(
        `${time.toFixed(0).padStart(5)}s | ` +
        `${state.y.toFixed(2).padStart(5)}m | ` +
        `${distance.toFixed(1).padStart(5)}m | ` +
        `${groundSpeed.toFixed(1).padStart(6)} | ` +
        `${airspeed.toFixed(1).padStart(6)} | ` +
        `${(pitch * 180/Math.PI).toFixed(1).padStart(5)}° | ` +
        `${ctrl.throttle.toFixed(2).padStart(5)} | ` +
        `${ctrl.elevator.toFixed(3).padStart(6)}`
      );

      // Detailed force output at t=5s
      if (Math.abs(time - 5) < dt) {
        console.log(`  DEBUG at t=5s:`);
        console.log(`    AoA: ${(aoa * 180/Math.PI).toFixed(2)}°, CL: ${liftCoeff.toFixed(3)}`);
        console.log(`    Lift: ${lift.toFixed(1)}N, Drag: ${drag.toFixed(1)}N, Weight: ${weight.toFixed(1)}N`);
        console.log(`    Thrust: ${thrust.toFixed(1)}N, RPM: ${state.rpm.toFixed(0)}`);
        console.log(`    L/W: ${(lift/weight).toFixed(3)}, T/D: ${(thrust/drag).toFixed(3)}`);
        console.log(`    Vy: ${state.vy.toFixed(3)} m/s`);
      }
    }

    time += dt;

    // Browser stops at exactly 12s
    if (time >= 12) {
      console.log('\n=== TIME LIMIT (12s) ===\n');
      break;
    }

    // Landing detection
    if (wasAirborne && state.y <= GROUND_LEVEL + 0.1 && state.vy <= 0 && time > 3) {
      console.log('\n=== LANDED ===\n');
      break;
    }
  }

  if (time >= 14) {
    console.log('\n=== TIMEOUT ===\n');
  }

  console.log(`Flight time: ${time.toFixed(1)}s (target: 12s)`);
  console.log(`Distance: ${distance.toFixed(1)}m (target: 36.5m)`);
  console.log(`Max altitude: ${maxAlt.toFixed(2)}m (target: 3.0m above sand)`);
  console.log(`Final altitude: ${state.y.toFixed(2)}m (target: 0m sand)`);
  console.log(`Launch rail: ${LAUNCH_RAIL_HEIGHT.toFixed(3)}m (3.5 inches)`);

  const timeErr = Math.abs(time - 12);
  const distErr = Math.abs(distance - 36.5);
  const altErr = Math.abs(maxAlt - 3.0);
  console.log(`\nErrors: time=${timeErr.toFixed(1)}s, dist=${distErr.toFixed(1)}m, maxAlt=${altErr.toFixed(2)}m`);

  return { time, distance, maxAlt, finalAlt: state.y };
}

// Test at browser-equivalent framerate (~34 FPS matches browser physics)
// Note: Euler integration is timestep-dependent, so results vary with FPS
const fps = parseInt(process.argv[2]) || 34;
simulate(fps);
