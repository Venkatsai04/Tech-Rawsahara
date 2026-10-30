import type { FC, ReactNode } from 'react'

import { useEffect, useRef } from 'react'
import { DOT_LEVELS, readCssColor, readDotColors } from '@/lib/dots/palette'

// Size of one dot cell in CSS pixels, matching the hero grid.
const CELL = 8

// Radius of the glow around the pointer, and of the faint grid around it, in CSS pixels.
const GLOW_RADIUS = 90
const GRID_RADIUS = 170

// How long a point of the trail stays lit, in milliseconds.
const TRAIL_MS = 650
const MAX_TRAIL = 24

type TrailPoint = {
    x: number
    y: number
    at: number
}

// A site-wide layer that lights up the dot grid wherever the pointer moves, leaving a short fading trail.
// It multiplies over the page, so text stays dark, and skips the hero, which has its own pointer lens.
export const CursorDots: FC = (): ReactNode => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d')

        if (!canvas || !context) return
        if (!window.matchMedia('(pointer: fine)').matches) return
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

        const ctx = context
        const colors = readDotColors()
        const gridColor = readCssColor('--grid-dot')
        const trail: Array<TrailPoint> = []

        let dpr = 1
        let cellPx = CELL
        let frame = 0
        let pointerX = -9999
        let pointerY = -9999
        let gridStrength = 0
        let inside = false

        const resize = (): void => {
            dpr = Math.min(window.devicePixelRatio || 1, 2)
            cellPx = Math.round(CELL * dpr)
            canvas.width = Math.round(window.innerWidth * dpr)
            canvas.height = Math.round(window.innerHeight * dpr)
        }

        const draw = (now: number): void => {
            frame = 0

            while (trail.length && now - trail[0].at > TRAIL_MS) trail.shift()

            gridStrength += ((inside ? 1 : 0) - gridStrength) * 0.12

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            if (!trail.length && gridStrength < 0.01) return

            const glowR = GLOW_RADIUS * dpr
            const gridR = GRID_RADIUS * dpr
            const px = pointerX * dpr
            const py = pointerY * dpr

            let minX = px - gridR
            let maxX = px + gridR
            let minY = py - gridR
            let maxY = py + gridR

            for (const point of trail) {
                minX = Math.min(minX, point.x * dpr - glowR)
                maxX = Math.max(maxX, point.x * dpr + glowR)
                minY = Math.min(minY, point.y * dpr - glowR)
                maxY = Math.max(maxY, point.y * dpr + glowR)
            }

            const col0 = Math.max(0, Math.floor(minX / cellPx))
            const col1 = Math.min(Math.ceil(canvas.width / cellPx), Math.ceil(maxX / cellPx))
            const row0 = Math.max(0, Math.floor(minY / cellPx))
            const row1 = Math.min(Math.ceil(canvas.height / cellPx), Math.ceil(maxY / cellPx))
            const glowR2 = glowR * glowR
            const gridR2 = gridR * gridR
            const gridSize = Math.max(1, Math.round(cellPx * 0.16))
            const gridOffset = Math.floor((cellPx - gridSize) / 2)

            for (let row = row0; row < row1; row++) {
                const cy = (row + 0.5) * cellPx

                for (let col = col0; col < col1; col++) {
                    const cx = (col + 0.5) * cellPx

                    let value = 0

                    for (let k = 0; k < trail.length; k++) {
                        const point = trail[k]
                        const dx = cx - point.x * dpr
                        const dy = cy - point.y * dpr
                        const distance = dx * dx + dy * dy

                        if (distance >= glowR2) continue

                        const life = 1 - (now - point.at) / TRAIL_MS
                        const glow = Math.exp((-distance / glowR2) * 3.2) * life * life

                        if (glow > value) value = glow
                    }

                    // Light dithering keeps the edge soft and dotted rather than a smooth blob.
                    const jitter = (((col * 7 + row * 13) % 5) - 2) * 0.03
                    const level = Math.min(4, Math.floor((value * 0.85 + jitter) * 5))

                    if (level >= 1) {
                        const size = Math.max(1, Math.round(cellPx * DOT_LEVELS[level - 1].size))
                        const offset = Math.floor((cellPx - size) / 2)

                        ctx.fillStyle = colors[level - 1]
                        ctx.fillRect(col * cellPx + offset, row * cellPx + offset, size, size)
                        continue
                    }

                    const gx = cx - px
                    const gy = cy - py
                    const gridDistance = gx * gx + gy * gy

                    if (gridStrength > 0.01 && gridDistance < gridR2) {
                        ctx.globalAlpha = (1 - gridDistance / gridR2) * gridStrength
                        ctx.fillStyle = gridColor
                        ctx.fillRect(col * cellPx + gridOffset, row * cellPx + gridOffset, gridSize, gridSize)
                        ctx.globalAlpha = 1
                    }
                }
            }

            frame = requestAnimationFrame(draw)
        }

        const wake = (): void => {
            if (!frame) frame = requestAnimationFrame(draw)
        }

        const onPointerMove = (event: PointerEvent): void => {
            const target = event.target instanceof Element ? event.target : null

            // The hero already has its own pointer lens.
            inside = !target?.closest('#top')
            pointerX = event.clientX
            pointerY = event.clientY

            if (inside) {
                const now = performance.now()
                const last = trail[trail.length - 1]

                if (!last || Math.hypot(last.x - pointerX, last.y - pointerY) > 6) {
                    trail.push({ x: pointerX, y: pointerY, at: now })

                    if (trail.length > MAX_TRAIL) trail.shift()
                }
            }

            wake()
        }

        const onPointerLeave = (): void => {
            inside = false
            wake()
        }

        resize()
        window.addEventListener('resize', resize)
        window.addEventListener('pointermove', onPointerMove, { passive: true })
        document.documentElement.addEventListener('pointerleave', onPointerLeave)

        return () => {
            cancelAnimationFrame(frame)
            window.removeEventListener('resize', resize)
            window.removeEventListener('pointermove', onPointerMove)
            document.documentElement.removeEventListener('pointerleave', onPointerLeave)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            aria-hidden='true'
            className='pointer-events-none fixed inset-0 z-40 size-full mix-blend-multiply'
        />
    )
}
