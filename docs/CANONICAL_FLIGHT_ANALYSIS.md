# Wright Flyer Canonical Flight Analysis

## Historical Data (December 17, 1903 - First Flight)

| Parameter | Value | Source |
|-----------|-------|--------|
| Duration | 12 seconds | Smithsonian |
| Distance | 120 ft = 36.5 m | Smithsonian |
| Max altitude | ~10 ft = ~3 m | Historical accounts |
| Headwind | 27 mph = 12 m/s | NPS |
| Ground speed | 6.8 mph = 3.04 m/s | Calculated |
| Airspeed | 34 mph = 15.2 m/s | NPS |

## Aircraft Specifications

| Parameter | Value | Source |
|-----------|-------|--------|
| Wing area | 510 sq ft = 47.4 m² | Smithsonian |
| Wingspan | 40 ft = 12.2 m | Smithsonian |
| Gross weight | 750 lb = 340 kg | Smithsonian |
| Engine power | 12 hp = 8,950 W | Smithsonian |
| CD0 | 0.047 | Culick research |
| Propeller efficiency | 66-84% | Research |
| L/D ratio | ~6:1 | Culick research |

## Steady Flight Physics

### At cruise (V = 15 m/s airspeed):

**Lift requirement:**
```
Weight = 340 × 9.81 = 3335 N
L = 0.5 × ρ × V² × S × CL
3335 = 0.5 × 1.225 × 225 × 47.4 × CL
CL_cruise = 0.51
```

**Drag calculation:**
```
CD = CD0 + CL²/(π × AR × e)
CD = 0.047 + 0.26/(π × 3.2 × 0.85)
CD = 0.077

D = 0.5 × 1.225 × 225 × 47.4 × 0.077 = 503 N
```

**L/D ratio:** 3335/503 = 6.6 ✓

**Thrust requirement:**
```
T = D = 503 N (for level flight)
```

**Available thrust:**
```
At V = 15 m/s, RPM = 400:
J = 15 / (400/60 × 2.6) = 0.87
η = 0.83 (from efficiency curve)
T = η × P / V = 0.83 × 8950 / 15 = 495 N
```

**Conclusion:** At full throttle, thrust (495 N) is slightly less than drag (503 N). The aircraft was marginally powered, consistent with historical accounts of "undulating" flight.

## Canonical Flight Profile

### Phase 1: Takeoff (0-2s)
- Start at ground level (0.7m)
- Initial ground velocity: 4 m/s (from launch rail)
- Initial airspeed: 16 m/s (ground + 12 m/s headwind)
- Throttle: High (0.8-0.9) for maximum thrust
- Elevator: Slight nose-up for climb

### Phase 2: Climb (2-5s)
- Climb to ~3m altitude
- Reduce throttle as altitude increases
- Maintain airspeed ~15 m/s

### Phase 3: Level flight (5-9s)
- Maintain ~3m altitude
- Cruise throttle ~0.7
- Fine elevator adjustments

### Phase 4: Descent (9-12s)
- Reduce throttle gradually
- Glide descent at ~6:1 L/D
- Touchdown at ground level (0.7m)
- Final distance: 36.5m

## Control Law Derivation

For the canonical 12s flight covering 36.5m:
- Average ground speed = 36.5/12 = 3.04 m/s
- With 12 m/s headwind → airspeed ≈ 15 m/s throughout

### Tuned Open-Loop Control

After extensive testing, open-loop control was found to work better than feedback control for this marginally-powered aircraft.

**Throttle Curve:**
- 0-10% flight: 0.90 (takeoff)
- 10-25% flight: transition 0.90 → 0.82
- 25-85% flight: 0.82 (cruise)
- 85-100% flight: transition 0.82 → 0.68 (descent)

**Elevator Curve:**
- 0-15% flight: +0.02 (slight nose-up for takeoff)
- 15-30% flight: transition +0.02 → -0.02
- 30-80% flight: -0.02 (level cruise)
- 80-100% flight: transition -0.02 → -0.04 (gentle descent)

### Simulation Results

| Parameter | Target | Achieved | Error |
|-----------|--------|----------|-------|
| Duration | 12.0s | 12.3s | 2.5% |
| Distance | 36.5m | 35.6m | 2.5% |
| Max Altitude | 3.0m | 2.8m | 6.7% |
| Final Altitude | 0.7m | 0.8m | 14% |

All parameters within acceptable tolerance for historically-based simulation.
