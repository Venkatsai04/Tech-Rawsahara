import type { FC, ReactNode } from 'react'
import type { DotField } from '@/lib/dots/fields'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { subscribeTick } from '@/lib/dots/ticker'
import { readCssColor, readDotColors } from '@/lib/dots/palette'
import {
    createGridLayer,
    paintDots,
    toLevel
} from '@/lib/dots/paint'

interface DotCanvasProps {
    field: DotField
    className?: string
    cell?: number
    mobileCell?: number
    maxCells?: number
    centerX?: number
    centerY?: number
    mobileCenterX?: number
    mobileCenterY?: number
    scale?: number
    speed?: number
    grid?: boolean
    interactive?: boolean
    startTime?: number
}

// Squared radius of the pointer lens, in field units.
const LENS = 0.028

const FRAME_MS = 1000 / 60 - 2

export const DotCanvas: FC<DotCanvasProps> = ({
    field,
    className,
    cell = 7,
    mobileCell = 5,
    maxCells = 24000,
    centerX = 0.5,
    centerY = 0.5,
    mobileCenterX,
    mobileCenterY,
    scale = 1,
    speed = 1,
    grid = false,
    interactive = false,
    startTime = 6
}): ReactNode => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d')

        if (!canvas || !context) return

        const ctx = context
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const finePointer = window.matchMedia('(pointer: fine)').matches
        const usePointer = interactive && finePointer && !reduceMotion
        const colors = readDotColors()
        const gridColor = readCssColor('--grid-dot')
        const pointer = { targetU: 0, targetV: 0, u: 0, v: 0, inside: false, strength: 0 }

        let width = 0
        let height = 0
        let cellPx = 0
        let cols = 0
        let rows = 0
        let unit = 1
        let originX = 0
        let originY = 0
        let us = new Float32Array(0)
        let vs = new Float32Array(0)
        let levels = new Uint8Array(0)
        let gridLayer: HTMLCanvasElement | null = null
        let time = startTime
        let last = 0
        let resizeFrame = 0
        let painted = false
        let unsubscribe: (() => void) | null = null

        const draw = (): void => {
            if (!cols || !rows) return

            const lens = usePointer && pointer.strength > 0.002

            for (let row = 0, index = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++, index++) {
                    let u = us[index]
                    let v = vs[index]
                    let glow = 0

                    if (lens) {
                        const dx = u - pointer.u
                        const dy = v - pointer.v
                        const distance = dx * dx + dy * dy

                        if (distance < LENS * 6) {
                            glow = Math.exp(-distance / LENS) * pointer.strength
                            u -= dx * glow * 0.32
                            v -= dy * glow * 0.32
                        }
                    }

                    let value = field(u, v, time, col, row)

                    if (glow > 0) value += glow * 0.3 * (1 - value * 0.5)

                    levels[index] = toLevel(value, col, row)
                }
            }

            ctx.clearRect(0, 0, width, height)

            if (gridLayer) ctx.drawImage(gridLayer, 0, 0)

            paintDots(ctx, levels, cols, rows, cellPx, colors)

            if (!painted) {
                painted = true
                setReady(true)
            }
        }

        const resize = (): void => {
            const rect = canvas.getBoundingClientRect()
            const cssWidth = Math.max(1, rect.width)
            const cssHeight = Math.max(1, rect.height)
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            const mobile = cssWidth < 640

            let cssCell = mobile ? mobileCell : cell

            while ((cssWidth / cssCell) * (cssHeight / cssCell) > maxCells) cssCell += 0.5

            cellPx = Math.max(2, Math.round(cssCell * dpr))
            width = Math.round(cssWidth * dpr)
            height = Math.round(cssHeight * dpr)
            canvas.width = width
            canvas.height = height
            cols = Math.ceil(width / cellPx)
            rows = Math.ceil(height / cellPx)
            unit = Math.min(width, height) * scale
            originX = width * (mobile && mobileCenterX !== undefined ? mobileCenterX : centerX)
            originY = height * (mobile && mobileCenterY !== undefined ? mobileCenterY : centerY)

            const count = cols * rows

            us = new Float32Array(count)
            vs = new Float32Array(count)
            levels = new Uint8Array(count)

            for (let row = 0, index = 0; row < rows; row++) {
                const y = ((row + 0.5) * cellPx - originY) / unit

                for (let col = 0; col < cols; col++, index++) {
                    us[index] = ((col + 0.5) * cellPx - originX) / unit
                    vs[index] = y
                }
            }

            gridLayer = grid ? createGridLayer(width, height, cols, rows, cellPx, gridColor) : null
            field.prepare?.({ cols, rows, cellPx, width, height })
            draw()
        }

        const tick = (now: number): void => {
            if (last && now - last < FRAME_MS) return

            const delta = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60

            last = now
            time += delta * speed

            if (usePointer) {
                pointer.u += (pointer.targetU - pointer.u) * 0.14
                pointer.v += (pointer.targetV - pointer.v) * 0.14
                pointer.strength += ((pointer.inside ? 1 : 0) - pointer.strength) * 0.06
            }

            draw()
        }

        const start = (): void => {
            if (unsubscribe || reduceMotion) return

            last = 0
            unsubscribe = subscribeTick(tick)
        }

        const stop = (): void => {
            unsubscribe?.()
            unsubscribe = null
        }

        const onPointerMove = (event: PointerEvent): void => {
            const rect = canvas.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top
            const ratio = width / Math.max(1, rect.width)

            pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height
            pointer.targetU = (x * ratio - originX) / unit
            pointer.targetV = (y * ratio - originY) / unit

            if (pointer.strength < 0.01) {
                pointer.u = pointer.targetU
                pointer.v = pointer.targetV
            }
        }

        const onPointerOut = (event: PointerEvent): void => {
            if (!event.relatedTarget) pointer.inside = false
        }

        const visibility = new IntersectionObserver(
            entries => {
                if (entries[0]?.isIntersecting) start()
                else stop()
            },
            { rootMargin: '120px 0px' }
        )

        const resizer = new ResizeObserver(() => {
            cancelAnimationFrame(resizeFrame)
            resizeFrame = requestAnimationFrame(resize)
        })

        resize()
        visibility.observe(canvas)
        resizer.observe(canvas)

        if (usePointer) {
            window.addEventListener('pointermove', onPointerMove, { passive: true })
            window.addEventListener('pointerout', onPointerOut)
        }

        return () => {
            stop()
            visibility.disconnect()
            resizer.disconnect()
            cancelAnimationFrame(resizeFrame)
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerout', onPointerOut)
        }
    }, [
        field,
        cell,
        mobileCell,
        maxCells,
        centerX,
        centerY,
        mobileCenterX,
        mobileCenterY,
        scale,
        speed,
        grid,
        interactive,
        startTime
    ])

    return (
        <canvas
            ref={canvasRef}
            aria-hidden='true'
            className={cn(
                'block size-full transition-opacity duration-1000 ease-out',
                ready ? 'opacity-100' : 'opacity-0',
                className
            )}
        />
    )
}
