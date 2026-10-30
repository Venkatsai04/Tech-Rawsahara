import type { FC, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { readDotColors, readCssColor } from '@/lib/dots/palette'

interface MatrixDecodeCanvasProps {
    className?: string
}

interface MatrixDot {
    originX: number
    originY: number
    x: number
    y: number
    targetX: number
    targetY: number
    baseIntensity: number
    intensity: number
    glitchChar?: string
    isChar: boolean
}

const GLYPHS = '0123456789ABCDEF<>[]#*/$%+=~'

export const MatrixDecodeCanvas: FC<MatrixDecodeCanvasProps> = ({ className }): ReactNode => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDecoding, setIsDecoding] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        let width = 0
        let height = 0
        let dpr = 1
        let cellPx = 7
        let cols = 0
        let rows = 0
        let dots: MatrixDot[] = []
        let animId = 0
        let time = 0

        // Laser scanline state
        let scanX = -100
        let scanActive = false
        let scanSpeed = 0
        let pointerX = -9999
        let pointerY = -9999
        let pointerInside = false

        const colors = readDotColors()
        const gridColor = readCssColor('--grid-dot')

        const initDots = () => {
            const rect = canvas.getBoundingClientRect()
            dpr = Math.min(window.devicePixelRatio || 1, 2)
            width = Math.round(Math.max(1, rect.width) * dpr)
            height = Math.round(Math.max(1, rect.height) * dpr)
            canvas.width = width
            canvas.height = height

            cellPx = Math.max(3, Math.round((width < 640 * dpr ? 5 : 7) * dpr))
            cols = Math.ceil(width / cellPx)
            rows = Math.ceil(height / cellPx)

            // Render SAHARA LABS to offscreen canvas to sample dot mask
            const offscreen = document.createElement('canvas')
            offscreen.width = cols
            offscreen.height = rows
            const oCtx = offscreen.getContext('2d', { willReadFrequently: true })
            if (!oCtx) return

            const fontFace =
                getComputedStyle(document.documentElement).getPropertyValue('--font-app-sans').trim() || 'sans-serif'
            oCtx.font = `700 100px ${fontFace}`
            const text = 'SAHARA LABS'
            const m = oCtx.measureText(text)
            const left = m.actualBoundingBoxLeft
            const ascent = m.actualBoundingBoxAscent
            const textW = Math.max(1, left + m.actualBoundingBoxRight)
            const textH = Math.max(1, ascent + m.actualBoundingBoxDescent)
            const scale = Math.min((0.96 * cols) / textW, (0.82 * rows) / textH)

            oCtx.setTransform(
                scale,
                0,
                0,
                scale,
                (cols - textW * scale) / 2 + left * scale,
                (rows - textH * scale) / 2 + ascent * scale
            )
            oCtx.fillStyle = '#000'
            oCtx.fillText(text, 0, 0)

            const mask = oCtx.getImageData(0, 0, cols, rows).data
            dots = []

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const idx = (r * cols + c) * 4
                    const alpha = mask[idx + 3] / 255
                    const px = (c + 0.5) * cellPx
                    const py = (r + 0.5) * cellPx

                    dots.push({
                        originX: px,
                        originY: py,
                        x: px,
                        y: py,
                        targetX: px,
                        targetY: py,
                        baseIntensity: alpha,
                        intensity: alpha,
                        isChar: alpha > 0.05
                    })
                }
            }
        }

        const triggerDecode = (clickX?: number) => {
            setIsDecoding(true)
            scanActive = true
            scanX = clickX !== undefined ? clickX * dpr : 0
            scanSpeed = width * 0.024

            // Scramble dots with cybernetic displacement
            for (let i = 0; i < dots.length; i++) {
                const dot = dots[i]
                if (dot.isChar) {
                    const angle = Math.random() * Math.PI * 2
                    const dist = 10 + Math.random() * 45 * dpr
                    dot.x = dot.originX + Math.cos(angle) * dist
                    dot.y = dot.originY + Math.sin(angle) * (dist * 0.4)
                    dot.glitchChar = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
                }
            }
        }

        const render = () => {
            time += 0.025
            ctx.clearRect(0, 0, width, height)

            // Advance Laser Scanline
            if (scanActive) {
                scanX += scanSpeed
                if (scanX > width + 100 * dpr) {
                    scanActive = false
                    setIsDecoding(false)
                }
            }

            const scanRadius = 90 * dpr

            for (let i = 0; i < dots.length; i++) {
                const dot = dots[i]

                // Elastic spring re-assembly back to origin
                dot.x += (dot.originX - dot.x) * 0.16
                dot.y += (dot.originY - dot.y) * 0.16

                if (!dot.isChar) {
                    // Faint ambient background grid dot
                    const distFromPointer = pointerInside
                        ? Math.hypot(dot.originX - pointerX * dpr, dot.originY - pointerY * dpr)
                        : 9999
                    if (distFromPointer < 120 * dpr) {
                        const alpha = (1 - distFromPointer / (120 * dpr)) * 0.45
                        ctx.fillStyle = gridColor
                        ctx.globalAlpha = alpha
                        ctx.fillRect(dot.originX - 1, dot.originY - 1, 2, 2)
                        ctx.globalAlpha = 1
                    }
                    continue
                }

                // Shimmer wave across text dots
                const u = dot.originX / width
                const v = dot.originY / height
                const wave = 0.6 + 0.4 * Math.sin(4.6 * u - 1.4 * time + 1.2 * Math.sin(3 * v + 0.5 * time))
                let intensity = dot.baseIntensity * wave

                // Laser scanline illumination & glyph glitch
                if (scanActive) {
                    const distToLaser = Math.abs(dot.originX - scanX)
                    if (distToLaser < scanRadius) {
                        const boost = (1 - distToLaser / scanRadius) ** 2
                        intensity = Math.min(1.4, intensity + boost * 1.5)
                        if (Math.random() < 0.25) {
                            dot.glitchChar = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
                        }
                    }
                }

                // Interactive Pointer lens effect
                if (pointerInside) {
                    const pDist = Math.hypot(dot.x - pointerX * dpr, dot.y - pointerY * dpr)
                    if (pDist < 80 * dpr) {
                        const pGlow = Math.exp((-pDist / (80 * dpr)) * 2)
                        intensity = Math.min(1.4, intensity + pGlow * 0.6)
                    }
                }

                // Determine dot color & size
                const lvl = Math.min(colors.length - 1, Math.max(0, Math.floor(intensity * colors.length)))
                const sizeFactor = 0.3 + intensity * 0.65
                const dotSize = Math.max(1.5, Math.round(cellPx * sizeFactor))
                const offset = Math.floor((cellPx - dotSize) / 2)

                ctx.fillStyle = colors[lvl] || '#6a00f5'

                // If currently glitching, occasionally draw a crisp cybernetic glyph
                if (scanActive && dot.glitchChar && Math.random() < 0.15) {
                    ctx.font = `${Math.round(cellPx * 0.9)}px monospace`
                    ctx.fillText(dot.glitchChar, dot.x - cellPx / 2, dot.y + cellPx / 2)
                } else {
                    ctx.fillRect(dot.x + offset, dot.y + offset, dotSize, dotSize)
                }
            }

            // Draw glowing vertical neon purple laser beam
            if (scanActive && scanX >= 0 && scanX <= width) {
                const laserGrad = ctx.createLinearGradient(scanX - 35 * dpr, 0, scanX + 35 * dpr, 0)
                laserGrad.addColorStop(0, 'rgba(106, 0, 245, 0)')
                laserGrad.addColorStop(0.4, 'rgba(154, 92, 251, 0.45)')
                laserGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)')
                laserGrad.addColorStop(0.6, 'rgba(154, 92, 251, 0.45)')
                laserGrad.addColorStop(1, 'rgba(106, 0, 245, 0)')

                ctx.fillStyle = laserGrad
                ctx.fillRect(scanX - 35 * dpr, 0, 70 * dpr, height)

                // Laser core line
                ctx.fillStyle = '#ffffff'
                ctx.fillRect(scanX - 1 * dpr, 0, 2 * dpr, height)
            }

            animId = requestAnimationFrame(render)
        }

        const handlePointerMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect()
            pointerInside = true
            pointerX = e.clientX - rect.left
            pointerY = e.clientY - rect.top
        }

        const handlePointerLeave = () => {
            pointerInside = false
        }

        const handleClick = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect()
            triggerDecode(e.clientX - rect.left)
        }

        initDots()
        animId = requestAnimationFrame(render)

        const resizeObserver = new ResizeObserver(() => {
            initDots()
        })
        resizeObserver.observe(canvas)

        canvas.addEventListener('mousemove', handlePointerMove)
        canvas.addEventListener('mouseleave', handlePointerLeave)
        canvas.addEventListener('click', handleClick)

        return () => {
            cancelAnimationFrame(animId)
            resizeObserver.disconnect()
            canvas.removeEventListener('mousemove', handlePointerMove)
            canvas.removeEventListener('mouseleave', handlePointerLeave)
            canvas.removeEventListener('click', handleClick)
        }
    }, [])

    return (
        <div className='group relative size-full cursor-pointer overflow-hidden' title='Click to trigger Cybernetic Decode'>
            <canvas ref={canvasRef} className='block size-full' />

            {/* Awwwards Minimal Floating Badge */}
            <div className='absolute bottom-3 right-4 z-20 flex items-center gap-2 rounded-full border border-ink/10 bg-white/85 px-3 py-1 font-mono text-[11px] text-muted-foreground opacity-75 backdrop-blur-xs transition-all duration-300 group-hover:scale-105 group-hover:border-azure-500 group-hover:text-azure-600 group-hover:opacity-100'>
                <Sparkles className={`size-3 text-azure-500 ${isDecoding ? 'animate-spin' : ''}`} />
                <span>{isDecoding ? 'DECODING MATRIX...' : 'CLICK TO DECODE MATRIX ◈'}</span>
            </div>
        </div>
    )
}
