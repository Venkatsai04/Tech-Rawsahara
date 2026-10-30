import type { FC, ReactNode } from 'react'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { subscribeTick } from '@/lib/dots/ticker'
import { createRandom } from '@/lib/dots/noise'
import { readDotColors } from '@/lib/dots/palette'
import { clamp01, paintDots, toLevel } from '@/lib/dots/paint'

interface HalftoneImageProps {
    src: string
    alt: string
    className?: string
    cell?: number
    mobileCell?: number
    focusX?: number
    focusY?: number
    sizes?: string
}

export const HalftoneImage: FC<HalftoneImageProps> = ({
    src,
    alt,
    className,
    cell = 6,
    mobileCell = 5,
    focusX = 0.5,
    focusY = 0.5,
    sizes = '(min-width: 1024px) 50vw, 100vw'
}): ReactNode => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const colors = readDotColors()
        const img = new window.Image()

        let width = 0
        let height = 0
        let cellPx = 0
        let cols = 0
        let rows = 0
        let sampleMap = new Float32Array(0)
        let buildOrder = new Float32Array(0)
        let levels = new Uint8Array(0)
        let progress = +!!reduceMotion
        let imgLoaded = false
        let imgRequested = false
        let enteredView = false
        let paintedOnce = false
        let lastTick = 0
        let resizeFrame = 0
        let unsubscribe: (() => void) | null = null

        const draw = (): void => {
            if (!cols || !rows || sampleMap.length !== cols * rows) return

            const building = progress < 1
            const threshold = 1.25 * progress

            for (let r = 0, idx = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++, idx++) {
                    let intensity = sampleMap[idx]
                    if (building) {
                        intensity *= clamp01((threshold - buildOrder[idx]) / 0.25)
                    }
                    levels[idx] = toLevel(intensity, c, r)
                }
            }

            ctx.clearRect(0, 0, width, height)
            paintDots(ctx, levels, cols, rows, cellPx, colors)

            if (!paintedOnce) {
                paintedOnce = true
                setReady(true)
            }
        }

        const computeSamples = (): void => {
            const count = cols * rows
            const random = createRandom(31 * cols + rows)

            sampleMap = new Float32Array(count)
            buildOrder = new Float32Array(count)
            levels = new Uint8Array(count)

            for (let r = 0, idx = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++, idx++) {
                    buildOrder[idx] = ((c / cols) * 0.55 + (r / rows) * 0.45) * 0.9 + 0.1 * random()
                }
            }

            const nw = img.naturalWidth
            const nh = img.naturalHeight
            if (!nw || !nh) return

            const targetRatio = width / height
            let srcW = nw
            let srcH = nh
            if (nw / nh > targetRatio) {
                srcW = nh * targetRatio
            } else {
                srcH = nw / targetRatio
            }

            const cropX = (nw - srcW) * focusX
            const cropY = (nh - srcH) * focusY

            const off4x = document.createElement('canvas')
            off4x.width = 4 * cols
            off4x.height = 4 * rows
            const ctx4x = off4x.getContext('2d')

            const off1x = document.createElement('canvas')
            off1x.width = cols
            off1x.height = rows
            const ctx1x = off1x.getContext('2d', { willReadFrequently: true })
            if (!ctx4x || !ctx1x) return

            const scaleW = width / cellPx
            const scaleH = height / cellPx

            ctx4x.fillStyle = '#ffffff'
            ctx4x.fillRect(0, 0, off4x.width, off4x.height)
            ctx4x.imageSmoothingEnabled = true
            ctx4x.imageSmoothingQuality = 'high'
            ctx4x.drawImage(img, cropX, cropY, srcW, srcH, 0, 0, 4 * scaleW, 4 * scaleH)

            ctx1x.imageSmoothingEnabled = true
            ctx1x.imageSmoothingQuality = 'high'
            ctx1x.drawImage(off4x, 0, 0, cols, rows)

            const pixelData = ctx1x.getImageData(0, 0, cols, rows).data
            const lums = new Float32Array(count)

            for (let i = 0; i < count; i++) {
                const p = 4 * i
                // Perceived luminance
                lums[i] = 1 - (0.2126 * pixelData[p] + 0.7152 * pixelData[p + 1] + 0.0722 * pixelData[p + 2]) / 255
            }

            const sorted = Float32Array.from(lums).sort()
            const lowPercentile = sorted[Math.floor(0.03 * count)]
            const highPercentile = Math.max(0.12, sorted[Math.min(count - 1, Math.floor(0.985 * count))] - lowPercentile)

            for (let i = 0; i < count; i++) {
                sampleMap[i] = Math.pow(clamp01((lums[i] - lowPercentile) / highPercentile), 0.9)
            }
        }

        const resize = (): void => {
            const rect = canvas.getBoundingClientRect()
            const cssW = Math.max(1, rect.width)
            const cssH = Math.max(1, rect.height)
            const dpr = Math.min(window.devicePixelRatio || 1, 2)

            cellPx = Math.max(2, Math.round((cssW < 640 ? mobileCell : cell) * dpr))
            width = Math.round(cssW * dpr)
            height = Math.round(cssH * dpr)
            canvas.width = width
            canvas.height = height
            cols = Math.ceil(width / cellPx)
            rows = Math.ceil(height / cellPx)

            if (imgLoaded) {
                computeSamples()
            }
            draw()
        }

        const stop = (): void => {
            unsubscribe?.()
            unsubscribe = null
        }

        const tick = (now: number): void => {
            const dt = lastTick ? Math.min((now - lastTick) / 1000, 0.05) : 1 / 60
            lastTick = now
            progress = Math.min(1, progress + dt / 1.6)
            draw()
            if (progress >= 1) stop()
        }

        const start = (): void => {
            if (!unsubscribe && !(progress >= 1) && imgLoaded && enteredView) {
                lastTick = 0
                unsubscribe = subscribeTick(tick)
            }
        }

        img.decoding = 'async'
        img.onerror = () => {
            if (img.src.includes('/_next/image')) {
                img.src = src
            }
        }
        img.onload = () => {
            imgLoaded = true
            resize()
            start()
        }

        const preloader = new IntersectionObserver(
            entries => {
                if (entries[0]?.isIntersecting && !imgRequested) {
                    imgRequested = true
                    img.src = src
                    preloader.disconnect()
                }
            },
            { rootMargin: '600px 0px' }
        )

        const viewportWatcher = new IntersectionObserver(
            entries => {
                if (entries[0]?.isIntersecting) {
                    enteredView = true
                    start()
                    viewportWatcher.disconnect()
                }
            },
            { rootMargin: '0px 0px -12% 0px' }
        )

        const resizer = new ResizeObserver(() => {
            cancelAnimationFrame(resizeFrame)
            resizeFrame = requestAnimationFrame(resize)
        })

        resize()
        preloader.observe(canvas)
        viewportWatcher.observe(canvas)
        resizer.observe(canvas)

        return () => {
            stop()
            preloader.disconnect()
            viewportWatcher.disconnect()
            resizer.disconnect()
            cancelAnimationFrame(resizeFrame)
            img.onload = null
            img.onerror = null
        }
    }, [src, cell, mobileCell, focusX, focusY])

    return (
        <div className={cn('group/halftone relative overflow-hidden', className)}>
            <Image
                src={src}
                alt={alt}
                fill
                sizes={sizes}
                className='halftone-photo object-cover opacity-0 transition-opacity duration-700 ease-out group-hover/halftone:opacity-100'
                style={{ objectPosition: `${100 * focusX}% ${100 * focusY}%` }}
            />
            <canvas
                ref={canvasRef}
                aria-hidden='true'
                className={cn(
                    'absolute inset-0 block size-full transition-opacity duration-700 ease-out group-hover/halftone:opacity-0',
                    ready ? 'opacity-100' : 'opacity-0'
                )}
            />
        </div>
    )
}
