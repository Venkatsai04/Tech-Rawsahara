import type { FC, ReactNode } from 'react'

import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { DotCanvas } from './dot-canvas'
import { createSilkField } from '@/lib/dots/fields'

interface SilkDriftProps {
    className?: string
}

interface DriftState {
    id: number
    top: number
    offset: number
    size: number
    side: 'left' | 'right'
    mirror: boolean
    tilt: number
    seed: number
    speed: number
    startTime: number
}

const randomRange = (min: number, max: number): number => min + Math.random() * (max - min)

const pickDrift = (id: number): DriftState => ({
    id,
    top: randomRange(10, 90),
    offset: randomRange(-15, 2),
    size: randomRange(30, 48),
    side: Math.random() > 0.5 ? 'left' : 'right',
    mirror: Math.random() > 0.5,
    tilt: randomRange(-0.35, 0.35),
    seed: Math.floor(randomRange(1, 9999)),
    speed: randomRange(0.7, 1.15),
    startTime: randomRange(0, 40)
})

export const SilkDrift: FC<SilkDriftProps> = ({ className }): ReactNode => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [drift, setDrift] = useState<DriftState | null>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setDrift(pickDrift(0))
            setVisible(true)
            return
        }

        let timer = 0
        let inView = false
        let count = 0

        const schedule = (fn: () => void, ms: number): void => {
            window.clearTimeout(timer)
            timer = window.setTimeout(fn, ms)
        }

        const fadeOut = (): void => {
            setVisible(false)
            schedule(() => {
                setDrift(null)
                schedule(nextDrift, randomRange(1200, 5000))
            }, 1500)
        }

        const nextDrift = (): void => {
            if (count > 0 && Math.random() < 0.3) {
                setDrift(null)
                schedule(nextDrift, randomRange(2500, 5000))
                return
            }
            setDrift(pickDrift(++count))
            schedule(() => {
                setVisible(true)
                schedule(fadeOut, randomRange(6500, 11000))
            }, 180)
        }

        const observer = new IntersectionObserver(
            entries => {
                const entry = entries[0]
                if (entry) {
                    if (entry.isIntersecting && !inView) {
                        inView = true
                        schedule(nextDrift, randomRange(1500, 3200))
                    } else if (!entry.isIntersecting && inView) {
                        inView = false
                        setVisible(false)
                        schedule(() => setDrift(null), 1500)
                    }
                }
            },
            { rootMargin: '-10% 0px' }
        )

        observer.observe(el)

        return () => {
            observer.disconnect()
            window.clearTimeout(timer)
        }
    }, [])

    const field = useMemo(() => (drift ? createSilkField(drift.seed, drift.tilt) : null), [drift])

    return (
        <div
            ref={containerRef}
            aria-hidden='true'
            className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
        >
            {drift && field && (
                <div
                    key={drift.id}
                    className={cn(
                        'silk-drift absolute aspect-square -translate-y-1/2 transition-opacity duration-[1400ms] ease-out',
                        visible ? 'opacity-60 md:opacity-80' : 'opacity-0'
                    )}
                    style={{
                        top: `${drift.top}%`,
                        left: drift.side === 'left' ? `${drift.offset}%` : undefined,
                        right: drift.side === 'right' ? `${drift.offset}%` : undefined,
                        width: `clamp(260px, ${drift.size}vw, 720px)`
                    }}
                >
                    <div className={cn('size-full', drift.mirror && '-scale-x-100')}>
                        <DotCanvas field={field} scale={0.62} maxCells={12000} speed={drift.speed} startTime={drift.startTime} />
                    </div>
                </div>
            )}
        </div>
    )
}
