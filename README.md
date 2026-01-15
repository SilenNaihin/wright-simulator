# Wright Flyer Simulation

![Wright Flyer Simulation Demo](wright-bros.gif)

A real-time 3D flight simulation of the Wright Brothers' 1903 Flyer that recreates the historic first powered flight at Kitty Hawk. Experience what Orville and Wilbur achieved on December 17, 1903 with historically accurate physics, authentic aircraft specifications, and a faithful recreation of the Kill Devil Hills environment.

## Features

- **Canonical Flight Mode**: Recreate the historic first flight (December 17, 1903) with automatically tuned controls matching the ~12 second, ~36.5 meter flight
- **Manual Flight Mode**: Take control yourself with realistic physics
- **Real-time Physics**: Accurate aerodynamic simulation including lift, drag, thrust, and pitch dynamics
- **Multiple Camera Views**: Switch between third-person and first-person (cockpit) perspectives
- **Live Telemetry**: Real-time charts showing lift/drag forces, engine power, airspeed, altitude, and control surface deflections
- **Period-Accurate Environment**: Kitty Hawk-inspired landscape with ocean, beach, sand dunes, and vegetation

## Controls

| Key | Action |
|-----|--------|
| `W` / `S` | Throttle up/down |
| `↑` / `↓` | Elevator (pitch) up/down |
| `←` / `→` | Rudder (yaw) left/right |
| `Q` / `E` | Wing warp (roll) left/right |
| `Space` | Start/Pause simulation |
| `C` | Cycle camera mode |

Using any control during Canonical Flight mode will exit automatic control and switch to manual mode.

## Historical Context

On December 17, 1903, Orville Wright piloted the first sustained, controlled, powered heavier-than-air flight at Kill Devil Hills, near Kitty Hawk, North Carolina.

**First Flight Statistics:**
- Duration: 12 seconds
- Distance: 120 feet (36.5 meters)
- Maximum altitude: ~10 feet (3 meters)
- Headwind: ~27 mph (12 m/s)

## Technical Details

### Wright Flyer Specifications (as simulated)
- Wingspan: 12.3 meters (40.3 feet)
- Wing Area: 47.4 m²
- Total Mass: 340 kg (750 lb including pilot)
- Engine Power: 12 HP (8,950 W)
- Propeller Diameter: 2.6 meters

### Physics Model
The simulation uses simplified but historically-grounded physics:
- Lift coefficient with angle of attack modeling
- Induced and parasitic drag calculations
- Propeller thrust with efficiency curves
- Pitch dynamics with elevator control
- Ground effect and takeoff mechanics

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **React** + **TypeScript** + **Vite**
- **Three.js** via **React Three Fiber** for 3D rendering
- **Zustand** for state management
- **Recharts** for real-time telemetry graphs
- **Tailwind CSS** for styling

## License

MIT
