// Test of canonical flight using updated physics model
// Run with: node test-flight.mjs

const GROUND_LEVEL = 0.7;
const GRAVITY = 9.81;
const AIR_DENSITY = 1.225;
const HEADWIND = 12; // m/s (~27 mph historical)

const SPECS = {
  wingArea: 47.4,
  totalMass: 340,  // historical gross weight
  maxRPM: 450,
  liftCoefficient0: 0.1,  // further reduced to limit climb
  liftCoefficientSlope: 5.5,
  maxLiftCoefficient: 1.2,
  stallAngle: 0.26,
  dragCoefficient0: 0.040,     // calibrated for flight
  aspectRatio: 3.2,
  oswaldEfficiency: 0.85,
  Iyy: 1800,
  enginePower: 8950,  // 12 hp in watts
  propellerDiameter: 2.6,
  elevatorEffectiveness: 1.5,
  elevatorArea: 4.6,
  maxElevatorDeflection: 0.35,
};

function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function smoothstep(t) {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}

// Target altitude profile for canonical flight
// Allow higher climb, then long slow descent
function getTargetAltitude(time) {
  const groundLevel = 0.7;
  const climbAlt = 3.0;   // Climb to 3m
  const cruiseAlt = 2.5;  // Cruise at 2.5m (allowing natural decay)

  if (time < 3) {
    // Climb: 0-3s
    return groundLevel + (climbAlt - groundLevel) * (time / 3);
  } else if (time < 5) {
    // Transition: 3-5s
    const progress = (time - 3) / 2;
    return climbAlt - (climbAlt - cruiseAlt) * progress;
  } else if (time < 10) {
    // Cruise with gentle descent: 5-10s
    const descentRate = 0.2;  // m/s
    return cruiseAlt - descentRate * (time - 5);
  } else {
    // Final descent: 10-12s
    const altAt10 = cruiseAlt - 0.2 * 5;  // 1.5m
    const descentProgress = (time - 10) / 2;
    return altAt10 - (altAt10 - groundLevel) * descentProgress;
  }
}

// Feedback control matching simulationStore.ts
// Tuned to match Wright Brothers first flight: 12s, 36.5m, 3m max altitude
function getControls(time, currentAltitude, verticalVelocity) {
  const duration = 12;
  const t = time / duration;

  // Throttle curve - tuned for 36.5m in 12s
  let throttle;
  if (t < 0.10) {
    throttle = 0.91;  // Takeoff
  } else if (t < 0.25) {
    const u = smoothstep((t - 0.10) / 0.15);
    throttle = lerp(0.91, 0.835, u);
  } else if (t < 0.78) {
    throttle = 0.835;  // Cruise - slightly higher
  } else {
    const u = smoothstep((t - 0.78) / 0.22);
    throttle = lerp(0.835, 0.58, u);
  }

  // Elevator profile - tuned for ~3m max altitude and landing at 12s
  let elevator;
  if (t < 0.15) {
    // Takeoff - slight nose-up
    elevator = 0.02;
  } else if (t < 0.30) {
    // Transition to cruise
    const u = smoothstep((t - 0.15) / 0.15);
    elevator = lerp(0.02, -0.019, u);
  } else if (t < 0.65) {
    // Cruise - nose-down to limit climb
    elevator = -0.019;
  } else {
    // Descent phase - start earlier to land at 12s
    const u = smoothstep((t - 0.65) / 0.35);
    elevator = lerp(-0.019, -0.065, u);
  }

  return { throttle: Math.max(0, throttle), elevator };
}

// Propeller efficiency based on advance ratio
function getPropellerEfficiency(velocity, rpm) {
  if (rpm < 10) return 0.3;
  const n = rpm / 60;
  const D = SPECS.propellerDiameter;
  const J = velocity / (n * D);
  const Jopt = 0.8;
  const peakEfficiency = 0.84;
  const minEfficiency = 0.40;
  const deviation = (J - Jopt) / 0.5;
  const efficiencyFactor = Math.exp(-deviation * deviation);
  return minEfficiency + (peakEfficiency - minEfficiency) * efficiencyFactor;
}

// Thrust calculation matching EngineModel.ts
function calculateThrust(throttle, rpm, velocity) {
  if (throttle < 0.01 || rpm < 10) return 0;

  const rpmFraction = rpm / SPECS.maxRPM;
  const powerCurve = rpmFraction * (2 - rpmFraction);
  const power = throttle * SPECS.enginePower * powerCurve;

  const efficiency = getPropellerEfficiency(velocity, rpm);
  const minVelocity = 3.0;

  if (velocity < minVelocity) {
    const staticThrust = 600 * (power / SPECS.enginePower);
    const blend = velocity / minVelocity;
    const dynamicThrust = efficiency * power / minVelocity;
    return staticThrust * (1 - blend) + dynamicThrust * blend;
  }

  return efficiency * power / velocity;
}

function simulate() {
  const dt = 1/60;

  // Initial state from aircraft.config.ts
  let y = 0.7, vy = 0, groundSpeed = 4, pitch = 0.075, pitchRate = 0, rpm = 380;
  let time = 0, distance = 0, maxAlt = y;
  let wasAirborne = false;

  console.log('=== FLIGHT SIMULATION ===\n');
  console.log('Target: 12s, 36.5m, max 3m, land at 0.7m\n');
  console.log('Time  | Alt  | Dist  | GndSpd | AirSpd | Pitch | Throt | Elev  | Lift/Wt | Thr/Drag');
  console.log('------|------|-------|--------|--------|-------|-------|-------|---------|--------');

  while (time < 14) {
    const ctrl = getControls(time, y, vy);

    // RPM response
    const targetRPM = 100 + ctrl.throttle * 350;
    rpm += (targetRPM - rpm) * dt * 2;

    // Airspeed = ground speed + headwind
    const airspeed = groundSpeed + HEADWIND;

    // Angle of attack
    const horizontalAirspeed = airspeed; // simplified
    const flightPath = horizontalAirspeed > 1 ? Math.atan2(vy, horizontalAirspeed) : 0;
    const aoa = pitch - flightPath;

    // Lift coefficient
    let cl = SPECS.liftCoefficient0 + SPECS.liftCoefficientSlope * aoa;
    cl = Math.max(-SPECS.maxLiftCoefficient, Math.min(SPECS.maxLiftCoefficient, cl));

    // Drag coefficient
    const cd = SPECS.dragCoefficient0 + (cl * cl) / (Math.PI * SPECS.aspectRatio * SPECS.oswaldEfficiency);

    // Dynamic pressure based on airspeed
    const q = 0.5 * AIR_DENSITY * airspeed * airspeed;
    const lift = q * SPECS.wingArea * cl;
    const drag = q * SPECS.wingArea * cd;
    const weight = SPECS.totalMass * GRAVITY;

    // Thrust using physics-based model
    const thrust = calculateThrust(ctrl.throttle, rpm, airspeed);

    // Vertical acceleration
    let ay = (lift * Math.cos(pitch) - weight) / SPECS.totalMass;

    // Horizontal acceleration
    let ax = (thrust - drag) / SPECS.totalMass;

    // Ground constraint
    const onGround = y <= GROUND_LEVEL + 0.05;
    if (onGround) {
      if (lift < weight) {
        ay = Math.max(0, ay);
        ax -= 0.02 * GRAVITY * Math.sign(groundSpeed);
      }
      if (vy < 0) {
        vy = 0;
        y = GROUND_LEVEL;
      }
    }

    // Pitch dynamics - matching FlightDynamics.ts
    const deflectionRad = ctrl.elevator * SPECS.maxElevatorDeflection;
    const elevMoment = q * SPECS.elevatorArea * SPECS.elevatorEffectiveness * deflectionRad * 1.8;

    // Damping and stability
    const dampMoment = -pitchRate * 150;
    const trimAoA = 0.075;
    const stabilityCoeff = 30;
    const pitchStability = -(aoa - trimAoA) * stabilityCoeff * (airspeed / 15);

    const pitchAccel = (elevMoment + dampMoment + pitchStability) / SPECS.Iyy;

    // Integrate
    vy += ay * dt;
    groundSpeed += ax * dt;
    groundSpeed = Math.max(0, groundSpeed);
    pitchRate += pitchAccel * dt;
    pitchRate *= 0.998; // angular damping

    y += vy * dt;
    distance += groundSpeed * dt;
    pitch += pitchRate * dt;
    pitch = Math.max(-0.3, Math.min(0.3, pitch));

    if (y < GROUND_LEVEL) {
      y = GROUND_LEVEL;
      vy = 0;
    }

    maxAlt = Math.max(maxAlt, y);
    if (y > GROUND_LEVEL + 0.5) wasAirborne = true;

    // Log every second
    if (Math.abs(time - Math.round(time)) < dt) {
      const liftWeightRatio = (lift / weight).toFixed(2);
      const thrustDragRatio = (thrust / drag).toFixed(2);
      console.log(
        `${time.toFixed(1).padStart(5)}s | ${y.toFixed(1).padStart(4)}m | ${distance.toFixed(1).padStart(5)}m | ` +
        `${groundSpeed.toFixed(1).padStart(6)} | ${airspeed.toFixed(1).padStart(6)} | ` +
        `${(pitch * 180 / Math.PI).toFixed(0).padStart(5)}° | ` +
        `${ctrl.throttle.toFixed(2).padStart(5)} | ${ctrl.elevator.toFixed(2).padStart(5)} | ` +
        `${liftWeightRatio.padStart(7)} | ${thrustDragRatio.padStart(7)}`
      );
    }

    time += dt;

    // Check landing
    if (wasAirborne && y <= GROUND_LEVEL + 0.1 && vy <= 0 && time > 3) {
      console.log('\n=== LANDED ===\n');
      console.log(`Flight time: ${time.toFixed(1)}s (target: 12s)`);
      console.log(`Distance: ${distance.toFixed(1)}m (target: 36.5m)`);
      console.log(`Max altitude: ${(maxAlt - GROUND_LEVEL).toFixed(1)}m above ground (target: ~3m)`);
      console.log(`Final altitude: ${y.toFixed(1)}m (target: 0.7m)`);

      const timeError = Math.abs(time - 12);
      const distError = Math.abs(distance - 36.5);
      const altError = Math.abs((maxAlt - GROUND_LEVEL) - 3);
      console.log(`\nErrors: time=${timeError.toFixed(1)}s, dist=${distError.toFixed(1)}m, alt=${altError.toFixed(1)}m`);
      return;
    }
  }

  console.log('\n=== TIMEOUT - Did not land ===\n');
  console.log(`Final time: 14s`);
  console.log(`Distance: ${distance.toFixed(1)}m`);
  console.log(`Max altitude: ${(maxAlt - GROUND_LEVEL).toFixed(1)}m above ground`);
  console.log(`Final altitude: ${y.toFixed(1)}m`);
}

simulate();
