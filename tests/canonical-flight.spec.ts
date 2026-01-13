import { test, expect } from '@playwright/test'

test('canonical flight simulation', async ({ page }) => {
  await page.goto('/')

  // Wait for app to load
  await page.waitForSelector('text=WRIGHT FLYER SIMULATION')

  // Click Simulation menu
  await page.click('text=Simulation')

  // Click Canonical Flight
  await page.click('text=Canonical Flight')

  console.log('Simulation started...')
  console.log('Time  | Alt   | Dist  | Airspeed | Thrust | Lift')
  console.log('------|-------|-------|----------|--------|------')

  let lastTime = 0
  let maxAlt = 0

  for (let i = 0; i < 50; i++) {
    await page.waitForTimeout(300)

    try {
      // Use more specific selectors
      const timeEl = page.locator('.text-2xl.font-mono.text-slate-200')
      const timeText = await timeEl.textContent({ timeout: 1000 })

      const altEl = page.locator('text=Altitude').locator('..').locator('span.text-emerald-400')
      const altText = await altEl.textContent({ timeout: 1000 })

      const distEl = page.locator('text=Distance').locator('..').locator('span.text-amber-400')
      const distText = await distEl.textContent({ timeout: 1000 })

      const airspeedEl = page.locator('text=Airspeed').locator('..').locator('span.text-cyan-400')
      const airspeedText = await airspeedEl.textContent({ timeout: 1000 })

      const thrustEl = page.locator('text=Thrust').locator('..').locator('span.text-rose-400')
      const thrustText = await thrustEl.textContent({ timeout: 1000 })

      const liftEl = page.locator('text=Lift').locator('..').locator('span.text-purple-400')
      const liftText = await liftEl.textContent({ timeout: 1000 })

      const maxAltEl = page.locator('text=Max Alt').locator('..').locator('div.text-lg')
      const maxAltText = await maxAltEl.textContent({ timeout: 1000 })

      const timeMatch = timeText?.match(/(\d+):(\d+)\.(\d+)/)
      const currentTime = timeMatch
        ? parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]) + parseInt(timeMatch[3]) / 100
        : 0

      const currentAlt = parseFloat(altText || '0')
      const currentDist = parseFloat(distText || '0')
      const currentAirspeed = parseFloat(airspeedText || '0')
      const currentThrust = parseFloat(thrustText || '0')
      const currentLift = parseFloat(liftText || '0')
      const currentMaxAlt = parseFloat(maxAltText?.replace('m', '') || '0')

      maxAlt = Math.max(maxAlt, currentMaxAlt)

      // Calculate approximate ground speed
      const groundSpeed = currentTime > 0 ? currentDist / currentTime : 0

      console.log(
        `${currentTime.toFixed(1).padStart(5)}s | ` +
        `${currentAlt.toFixed(1).padStart(5)}m | ` +
        `${currentDist.toFixed(1).padStart(5)}m | ` +
        `${currentAirspeed.toFixed(1).padStart(8)} | ` +
        `${currentThrust.toFixed(0).padStart(6)} | ` +
        `${currentLift.toFixed(0).padStart(5)} | ` +
        `avgSpd=${groundSpeed.toFixed(1)}`
      )

      if (currentTime > 0 && currentTime === lastTime) {
        console.log('\n=== COMPLETE ===')
        console.log(`Time: ${currentTime.toFixed(1)}s | Dist: ${currentDist.toFixed(1)}m | MaxAlt: ${maxAlt.toFixed(1)}m`)
        break
      }

      lastTime = currentTime
    } catch (e) {
      // Modal appeared, simulation ended
      console.log('\n=== SIMULATION ENDED ===')
      console.log(`Max altitude: ${maxAlt.toFixed(1)}m`)
      break
    }
  }
})
