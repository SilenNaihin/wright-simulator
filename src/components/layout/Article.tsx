import { X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

export function Article() {
  const { isArticleOpen, toggleArticle } = useUIStore()

  if (!isArticleOpen) return null

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm overflow-auto">
      <div className="max-w-4xl mx-auto px-8 py-6">
        {/* Close button */}
        <button
          onClick={toggleArticle}
          className="fixed top-4 right-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Article content */}
        <article className="prose prose-invert prose-slate max-w-none">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            The 1903 Wright Flyer
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            A Complete Technical & Historical Breakdown
          </p>

          {/* Location & Conditions */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-emerald-400 border-b border-slate-700 pb-2 mb-4">
              Location & Conditions
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-slate-500 uppercase text-xs tracking-wider mb-1">Date</div>
                <div className="text-slate-200">December 17, 1903</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-slate-500 uppercase text-xs tracking-wider mb-1">Location</div>
                <div className="text-slate-200">Kill Devil Hills, near Kitty Hawk, NC</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-slate-500 uppercase text-xs tracking-wider mb-1">Wind</div>
                <div className="text-slate-200">~20-27 mph headwind</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-slate-500 uppercase text-xs tracking-wider mb-1">Launch Method</div>
                <div className="text-slate-200">Wooden monorail + dolly, no wheels</div>
              </div>
            </div>
          </section>

          {/* Launch Rail Details */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-emerald-400 border-b border-slate-700 pb-2 mb-4">
              The Launch Rail
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-slate-500 uppercase text-xs tracking-wider mb-1">Total Length</div>
                <div className="text-slate-200">60 ft (18.3 m)</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-slate-500 uppercase text-xs tracking-wider mb-1">Construction</div>
                <div className="text-slate-200">Four 15-foot 2×4 lumber sections</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-slate-500 uppercase text-xs tracking-wider mb-1">Rail Height</div>
                <div className="text-amber-400 font-semibold">3.5 inches (8.9 cm)</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-slate-500 uppercase text-xs tracking-wider mb-1">Surface</div>
                <div className="text-slate-200">Metal-capped wood on sand</div>
              </div>
            </div>
            <p className="text-slate-300 text-sm">
              The rail was laid directly on the beach sand at Kill Devil Hills. The Flyer sat on a small
              dolly with two modified bicycle wheel hubs that rolled along the rail. After liftoff, the
              dolly stayed on the rail while the aircraft flew. The landing was made directly on the soft
              sand - there was no landing gear, just wooden skids.
            </p>
          </section>

          {/* Flight Summary */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-emerald-400 border-b border-slate-700 pb-2 mb-4">
              All Four Flights - December 17, 1903
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400">Flight</th>
                    <th className="text-left py-3 px-4 text-slate-400">Pilot</th>
                    <th className="text-left py-3 px-4 text-slate-400">Duration</th>
                    <th className="text-left py-3 px-4 text-slate-400">Distance</th>
                    <th className="text-left py-3 px-4 text-slate-400">Max Altitude</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-800 bg-cyan-500/10">
                    <td className="py-3 px-4 text-cyan-400 font-semibold">1st</td>
                    <td className="py-3 px-4 text-slate-200">Orville</td>
                    <td className="py-3 px-4 text-slate-200">12 s</td>
                    <td className="py-3 px-4 text-slate-200">120 ft (36.5 m)</td>
                    <td className="py-3 px-4 text-slate-200">~10 ft (3 m)</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 text-slate-300">2nd</td>
                    <td className="py-3 px-4 text-slate-300">Wilbur</td>
                    <td className="py-3 px-4 text-slate-300">12 s</td>
                    <td className="py-3 px-4 text-slate-300">175 ft (53 m)</td>
                    <td className="py-3 px-4 text-slate-300">~10-12 ft</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 text-slate-300">3rd</td>
                    <td className="py-3 px-4 text-slate-300">Orville</td>
                    <td className="py-3 px-4 text-slate-300">15 s</td>
                    <td className="py-3 px-4 text-slate-300">200 ft (61 m)</td>
                    <td className="py-3 px-4 text-slate-300">~12 ft</td>
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 text-slate-300">4th</td>
                    <td className="py-3 px-4 text-slate-300">Wilbur</td>
                    <td className="py-3 px-4 text-slate-300">59 s</td>
                    <td className="py-3 px-4 text-slate-300">852 ft (260 m)</td>
                    <td className="py-3 px-4 text-slate-300">~15-20 ft</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-400 text-sm mt-3 italic">
              The first flight (highlighted) is what this simulation recreates.
            </p>
          </section>

          {/* Takeoff & Speed */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-emerald-400 border-b border-slate-700 pb-2 mb-4">
              Takeoff & Speed
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-amber-400">~6-7 mph</div>
                <div className="text-slate-500 text-xs uppercase tracking-wider mt-1">Ground Speed</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">~30 mph</div>
                <div className="text-slate-500 text-xs uppercase tracking-wider mt-1">Airspeed</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">~20-27 mph</div>
                <div className="text-slate-500 text-xs uppercase tracking-wider mt-1">Headwind</div>
              </div>
            </div>
            <p className="text-slate-300 text-sm">
              The strong headwind dramatically reduced the required ground run. If airspeed required
              was ~30 mph and headwind was ~20-27 mph, then ground speed needed was only ~3-10 mph.
              This is why the Flyer could lift off such a short rail.
            </p>
          </section>

          {/* Engine */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-emerald-400 border-b border-slate-700 pb-2 mb-4">
              Propulsion System
            </h2>
            <h3 className="text-lg font-medium text-slate-200 mb-3">Engine</h3>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Type:</span>
                <span className="text-slate-200 ml-2">Inline 4-cylinder, gasoline</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Designer:</span>
                <span className="text-slate-200 ml-2">Charlie Taylor</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Weight:</span>
                <span className="text-slate-200 ml-2">~180 lb (82 kg)</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Power Output:</span>
                <span className="text-slate-200 ml-2">~12 hp @ ~1020 rpm</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Cooling:</span>
                <span className="text-slate-200 ml-2">Water-cooled</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Ignition:</span>
                <span className="text-slate-200 ml-2">Low-voltage magneto</span>
              </div>
            </div>

            <h3 className="text-lg font-medium text-slate-200 mb-3 mt-6">Engine Torque (Estimated)</h3>
            <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
              <div className="font-mono text-sm text-slate-300 mb-2">
                Torque = (5252 × HP) / RPM
              </div>
              <div className="font-mono text-sm text-slate-300 mb-2">
                &asymp; (5252 × 12) / 1020 &asymp; <span className="text-amber-400 font-bold">62 lb·ft</span>
              </div>
              <p className="text-slate-500 text-xs mt-2">
                Confidence: Medium (derived from horsepower & rpm, never directly measured)
              </p>
            </div>

            <h3 className="text-lg font-medium text-slate-200 mb-3 mt-6">Propellers (The Real Breakthrough)</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Count:</span>
                <span className="text-slate-200 ml-2">2 (counter-rotating)</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Diameter:</span>
                <span className="text-slate-200 ml-2">8.5 ft (2.6 m)</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Material:</span>
                <span className="text-slate-200 ml-2">Laminated spruce</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Efficiency:</span>
                <span className="text-emerald-400 ml-2 font-semibold">~66%</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 col-span-2">
                <span className="text-slate-500">Drive:</span>
                <span className="text-slate-200 ml-2">Bicycle chains, 23:8 reduction ratio</span>
              </div>
            </div>
            <p className="text-slate-300 text-sm mt-4">
              The propellers were treated as rotating wings, not screws - this was arguably the
              Wrights' greatest contribution. Modern propeller theory begins here.
            </p>
          </section>

          {/* Airframe */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-emerald-400 border-b border-slate-700 pb-2 mb-4">
              Airframe & Aerodynamics
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Wingspan:</span>
                <span className="text-slate-200 ml-2">40 ft 4 in (12.3 m)</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Wing Area:</span>
                <span className="text-slate-200 ml-2">~510 ft² (47.4 m²)</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Aspect Ratio:</span>
                <span className="text-slate-200 ml-2">~6.4</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Empty Weight:</span>
                <span className="text-slate-200 ml-2">~605 lb (274 kg)</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Gross Weight:</span>
                <span className="text-slate-200 ml-2">~745 lb (338 kg)</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Lift Coefficient:</span>
                <span className="text-slate-200 ml-2">Cl<sub>max</sub> ~0.5-0.6</span>
              </div>
            </div>
          </section>

          {/* Control System */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-emerald-400 border-b border-slate-700 pb-2 mb-4">
              Control System
            </h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-purple-400 font-semibold text-lg mb-1">Pitch</div>
                <div className="text-slate-300">Forward elevator (canard)</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-purple-400 font-semibold text-lg mb-1">Roll</div>
                <div className="text-slate-300">Wing warping</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-purple-400 font-semibold text-lg mb-1">Yaw</div>
                <div className="text-slate-300">Rear rudder (linked to roll)</div>
              </div>
            </div>
            <p className="text-amber-400 text-sm mt-4 font-medium">
              Important: The aircraft was actively unstable - it required constant pilot input.
              This was the first fully controlled powered airplane.
            </p>
          </section>

          {/* Flight Dynamics */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-emerald-400 border-b border-slate-700 pb-2 mb-4">
              First Flight Dynamics
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Acceleration:</span>
                <span className="text-slate-200 ml-2">Slow, marginal thrust</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Climb Rate:</span>
                <span className="text-slate-200 ml-2">~0 (ground effect dominant)</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Flight Path:</span>
                <span className="text-slate-200 ml-2">Oscillatory pitch ("porpoising")</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <span className="text-slate-500">Max Height:</span>
                <span className="text-slate-200 ml-2">~10 ft (3 m)</span>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 col-span-2">
                <span className="text-slate-500">Landing:</span>
                <span className="text-slate-200 ml-2">Skids in sand</span>
              </div>
            </div>
          </section>

          {/* What Was Not Measured */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-emerald-400 border-b border-slate-700 pb-2 mb-4">
              What Was Not Measured (1903)
            </h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { param: 'Exact torque curve', known: false },
                { param: 'Exact thrust (lbs)', known: false, note: 'Est. ~90 lb combined' },
                { param: 'Lift-to-drag ratio', known: false, note: 'Inferred' },
                { param: 'Prop RPM under load', known: false, note: 'Estimated' },
                { param: 'Control surface deflections', known: false },
              ].map((item, i) => (
                <div key={i} className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-slate-300">{item.param}</span>
                  <span className="text-red-400 text-xs">Not recorded</span>
                </div>
              ))}
            </div>
          </section>

          {/* Why This Worked */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-emerald-400 border-b border-slate-700 pb-2 mb-4">
              Why This Worked (Despite Everything)
            </h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">&#x2713;</span>
                <span className="text-slate-300"><strong className="text-slate-200">Accurate wind tunnel data</strong> - The Wrights built their own wind tunnel to gather precise aerodynamic data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">&#x2713;</span>
                <span className="text-slate-300"><strong className="text-slate-200">Correct lift & drag coefficients</strong> - Better than Lilienthal's tables which had errors</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">&#x2713;</span>
                <span className="text-slate-300"><strong className="text-slate-200">Propellers treated as aerodynamic surfaces</strong> - Revolutionary approach that is still used today</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">&#x2713;</span>
                <span className="text-slate-300"><strong className="text-slate-200">Integrated control design</strong> - Not stability-first, but controllability-first</span>
              </li>
            </ul>
          </section>

          {/* Footer */}
          <div className="text-center text-slate-500 text-sm pt-6 border-t border-slate-700">
            <p>The Wright Brothers achieved the first sustained, controlled, powered heavier-than-air flight.</p>
            <p className="mt-1">This simulation recreates that historic 12-second journey.</p>
          </div>
        </article>
      </div>
    </div>
  )
}
