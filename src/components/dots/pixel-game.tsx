import type { FC, ReactNode } from 'react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
    Play,
    RotateCcw,
    X,
    Trophy,
    Heart,
    Maximize2,
    Minimize2,
    Volume2,
    VolumeX,
    Zap
} from 'lucide-react'
import { readDotColors, readCssColor } from '@/lib/dots/palette'

interface PixelGameProps {
    className?: string
    onExit?: () => void
}

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    life: number
    maxLife: number
    size: number
    color: string
}

interface BallTrail {
    x: number
    y: number
    r: number
    alpha: number
}

interface Ball {
    x: number
    y: number
    vx: number
    vy: number
    r: number
    stuck: boolean
    trail: BallTrail[]
}

interface Shockwave {
    x: number
    y: number
    r: number
    maxR: number
    alpha: number
    color: string
}

interface FloatingText {
    x: number
    y: number
    text: string
    color: string
    life: number
    maxLife: number
    vy: number
    scale: number
}

interface PowerUp {
    x: number
    y: number
    vy: number
    type: 'triples' | 'wide' | 'fire'
    label: string
    color: string
}

export const PixelGame: FC<PixelGameProps> = ({ className, onExit }): ReactNode => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const [mounted, setMounted] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [score, setScore] = useState(0)
    const [lives, setLives] = useState(3)
    const [gameOver, setGameOver] = useState(false)
    const [gameWon, setGameWon] = useState(false)
    const [totalBricks, setTotalBricks] = useState(0)
    const [destroyedCount, setDestroyedCount] = useState(0)
    const [isFullViewport, setIsFullViewport] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [activeCombo, setActiveCombo] = useState(0)

    const isPlayingRef = useRef(false)
    const isFullViewportRef = useRef(false)
    const scoreRef = useRef(0)
    const livesRef = useRef(3)
    const destroyedRef = useRef(0)
    const totalBricksRef = useRef(0)
    const isMutedRef = useRef(false)
    const comboRef = useRef(0)

    const paddleTargetXRef = useRef<number | null>(null)
    const triggerStartRef = useRef<() => void>(() => {})
    const triggerResetRef = useRef<() => void>(() => {})

    isFullViewportRef.current = isFullViewport
    isMutedRef.current = isMuted

    useEffect(() => {
        setMounted(true)
    }, [])

    // Prevent body scrolling when in full viewport mode
    useEffect(() => {
        if (isFullViewport) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isFullViewport])

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d', { alpha: false })
        if (!canvas || !ctx) return

        let width = 0
        let height = 0
        let dpr = 1
        let cellPx = 6
        let cols = 0
        let rows = 0

        let grid = new Uint8Array(0)
        let particles: Particle[] = []
        let shockwaves: Shockwave[] = []
        let floatingTexts: FloatingText[] = []
        let powerUps: PowerUp[] = []
        let balls: Ball[] = []

        let animId = 0
        let time = 0
        let screenShake = 0

        // Paddle
        let paddleW = 120
        let paddleH = 8
        let paddleX = 0
        let paddleY = 0
        let paddleBaseW = 120
        let widePaddleTimer = 0

        // Ball speed & state
        let ballBaseSpeed = 6.2
        let ballR = 4.5
        let fireBallTimer = 0

        // Pointer
        let pointerInside = false
        let pointerClientX = -9999
        let pointerClientY = -9999

        const colors = readDotColors()
        const gridDotColor = readCssColor('--grid-dot') || '#e5e7eb'
        const inkColor = '#080808'
        const azureColor = '#6a00f5'
        const violetColor = '#9a5cfb'
        const whiteColor = '#ffffff'
        const amberColor = '#f59e0b'

        // Procedural Audio Engine
        let audioCtx: AudioContext | null = null
        const getAudio = () => {
            if (!audioCtx && typeof window !== 'undefined') {
                const AudioConstructor =
                    window.AudioContext ||
                    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
                if (AudioConstructor) {
                    audioCtx = new AudioConstructor()
                }
            }
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume().catch(() => {})
            }
            return audioCtx
        }

        const playTone = (freq: number, type: OscillatorType = 'sine', duration = 0.08, vol = 0.12) => {
            if (isMutedRef.current) return
            try {
                const actx = getAudio()
                if (!actx) return
                const osc = actx.createOscillator()
                const gain = actx.createGain()
                osc.type = type
                osc.frequency.setValueAtTime(freq, actx.currentTime)
                gain.gain.setValueAtTime(vol, actx.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + duration)
                osc.connect(gain)
                gain.connect(actx.destination)
                osc.start()
                osc.stop(actx.currentTime + duration)
            } catch {
                // Ignore audio errors
            }
        }

        const playPaddleSound = () => {
            playTone(280, 'triangle', 0.09, 0.15)
        }

        const playHitSound = (combo: number) => {
            const baseFreq = 440 + Math.min(12, combo) * 55
            playTone(baseFreq, 'sine', 0.08, 0.14)
        }

        const playPerfectSound = () => {
            playTone(660, 'triangle', 0.1, 0.16)
            setTimeout(() => playTone(880, 'triangle', 0.14, 0.18), 60)
            setTimeout(() => playTone(1100, 'sine', 0.22, 0.2), 120)
        }

        const playPowerUpSound = () => {
            playTone(523.25, 'triangle', 0.08, 0.15)
            setTimeout(() => playTone(659.25, 'triangle', 0.08, 0.15), 60)
            setTimeout(() => playTone(783.99, 'sine', 0.18, 0.18), 120)
        }

        const spawnFloatingText = (x: number, y: number, text: string, color = azureColor, scale = 1) => {
            floatingTexts.push({
                x,
                y,
                text,
                color,
                life: 1,
                maxLife: 32,
                vy: -1.5 * dpr,
                scale
            })
        }

        const spawnShockwave = (x: number, y: number, color = azureColor) => {
            shockwaves.push({
                x,
                y,
                r: 3 * dpr,
                maxR: (24 + Math.random() * 10) * dpr,
                alpha: 0.85,
                color
            })
        }

        const initBoard = () => {
            const rect = canvas.getBoundingClientRect()
            dpr = Math.min(window.devicePixelRatio || 1, 2)
            width = Math.round(Math.max(1, rect.width) * dpr)
            height = Math.round(Math.max(1, rect.height) * dpr)
            canvas.width = width
            canvas.height = height

            // Micro-dot cell size: fine 5-6px CSS px
            const baseCell = width < 640 * dpr ? 4.5 : 5.5
            cellPx = Math.max(3, Math.round(baseCell * dpr))
            cols = Math.ceil(width / cellPx)
            rows = Math.ceil(height / cellPx)

            grid = new Uint8Array(cols * rows)
            particles = []
            shockwaves = []
            floatingTexts = []
            powerUps = []

            // Render SAHARA LABS to offscreen mask
            const offscreen = document.createElement('canvas')
            offscreen.width = cols
            offscreen.height = rows
            const oCtx = offscreen.getContext('2d', { willReadFrequently: true })
            if (!oCtx) return

            const fontFace =
                getComputedStyle(document.documentElement).getPropertyValue('--font-app-sans').trim() ||
                'Host Grotesk, sans-serif'
            oCtx.font = `800 100px ${fontFace}`
            const text = 'SAHARA LABS'
            const metrics = oCtx.measureText(text)
            const textWidth = Math.max(1, metrics.width)
            const textHeight = 85

            // Exact layout with generous margins so SAHARA LABS NEVER gets cut off
            const targetWidth = cols * 0.86
            const targetHeight = rows * (isFullViewportRef.current ? 0.44 : 0.52)
            const scale = Math.min(targetWidth / textWidth, targetHeight / textHeight)

            const posX = (cols - textWidth * scale) / 2
            const topRatio = isFullViewportRef.current ? 0.36 : 0.42
            const posY = rows * topRatio + (textHeight * scale) / 2

            oCtx.setTransform(scale, 0, 0, scale, posX, posY)
            oCtx.fillStyle = '#000000'
            oCtx.fillText(text, 0, 0)

            const maskData = oCtx.getImageData(0, 0, cols, rows).data
            let brickCount = 0

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const idx = (r * cols + c) * 4
                    const alpha = maskData[idx + 3]

                    if (alpha > 45) {
                        const lvl = Math.min(4, Math.max(1, Math.floor((alpha / 255) * 4) + 1))
                        grid[r * cols + c] = lvl
                        brickCount++
                    } else {
                        grid[r * cols + c] = 0
                    }
                }
            }

            totalBricksRef.current = brickCount
            setTotalBricks(brickCount)
            destroyedRef.current = 0
            setDestroyedCount(0)

            // Setup paddle
            paddleBaseW = Math.max(100 * dpr, width * 0.15)
            paddleW = paddleBaseW
            paddleH = Math.max(7 * dpr, 8)
            paddleX = width / 2
            paddleY = height - 28 * dpr

            // Setup ball
            ballR = Math.max(3.5 * dpr, 4.5)
            ballBaseSpeed = Math.max(5.2 * dpr, 6.2)

            balls = [
                {
                    x: paddleX,
                    y: paddleY - paddleH / 2 - ballR - 1,
                    vx: 0,
                    vy: 0,
                    r: ballR,
                    stuck: true,
                    trail: []
                }
            ]
        }

        const resetSingleBall = (ball: Ball) => {
            ball.stuck = true
            ball.x = paddleX
            ball.y = paddleY - paddleH / 2 - ball.r - 1
            ball.vx = 0
            ball.vy = 0
            ball.trail = []
        }

        const launchBall = (ball: Ball) => {
            if (!ball.stuck) return
            ball.stuck = false
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5
            const speed = ballBaseSpeed
            ball.vx = Math.cos(angle) * speed
            ball.vy = Math.sin(angle) * speed
            playTone(380, 'sine', 0.1, 0.12)
        }

        const launchAllBalls = () => {
            balls.forEach(b => launchBall(b))
        }

        const startGame = () => {
            isPlayingRef.current = true
            setIsPlaying(true)
            setGameOver(false)
            setGameWon(false)
            scoreRef.current = 0
            setScore(0)
            livesRef.current = 3
            setLives(3)
            comboRef.current = 0
            setActiveCombo(0)
            widePaddleTimer = 0
            fireBallTimer = 0
            initBoard()
            launchAllBalls()
        }

        const resetGame = () => {
            startGame()
        }

        triggerStartRef.current = startGame
        triggerResetRef.current = resetGame

        // Explode micro particles
        const explodeBrick = (cx: number, cy: number, color: string, count = 3) => {
            if (particles.length > 90) return
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2
                const speed = (1 + Math.random() * 3.2) * dpr
                particles.push({
                    x: cx,
                    y: cy,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 0.9 * dpr,
                    life: 1,
                    maxLife: 18 + Math.random() * 14,
                    size: Math.max(1.5, Math.round(cellPx * 0.45)),
                    color
                })
            }
        }

        // CLEAR 3 BRICKS AT ONE TURN:
        const clear3Cluster = (centerCol: number, centerRow: number, impactX: number, impactY: number) => {
            let hitCount = 0
            const cleared: Array<{ c: number; r: number; lvl: number }> = []

            // Center brick
            const cIdx = centerRow * cols + centerCol
            if (grid[cIdx] > 0) {
                cleared.push({ c: centerCol, r: centerRow, lvl: grid[cIdx] })
                grid[cIdx] = 0
                hitCount++
            }

            // Find closest adjacent neighbors
            const candidates: Array<{ c: number; r: number; dist: number }> = []
            for (let r = Math.max(0, centerRow - 2); r <= Math.min(rows - 1, centerRow + 2); r++) {
                for (let c = Math.max(0, centerCol - 2); c <= Math.min(cols - 1, centerCol + 2); c++) {
                    if (c === centerCol && r === centerRow) continue
                    const idx = r * cols + c
                    if (grid[idx] > 0) {
                        const dist = Math.hypot(c - centerCol, r - centerRow)
                        candidates.push({ c, r, dist })
                    }
                }
            }
            candidates.sort((a, b) => a.dist - b.dist)

            for (const cand of candidates) {
                if (hitCount >= 3) break // EXACTLY 3 BRICKS CLEARED AT ONE TURN
                const idx = cand.r * cols + cand.c
                if (grid[idx] > 0) {
                    cleared.push({ c: cand.c, r: cand.r, lvl: grid[idx] })
                    grid[idx] = 0
                    hitCount++
                }
            }

            cleared.forEach(({ c, r, lvl }) => {
                const bx = (c + 0.5) * cellPx
                const by = (r + 0.5) * cellPx
                const brickColor = colors[lvl - 1] || azureColor
                explodeBrick(bx, by, brickColor, 3)
            })

            destroyedRef.current += hitCount
            setDestroyedCount(destroyedRef.current)

            comboRef.current++
            const currentCombo = comboRef.current
            setActiveCombo(currentCombo)

            const pointsEarned = hitCount * 10 * Math.max(1, Math.min(5, currentCombo))
            scoreRef.current += pointsEarned
            setScore(scoreRef.current)

            spawnShockwave(impactX, impactY, currentCombo >= 3 ? amberColor : azureColor)
            screenShake = Math.min(5, screenShake + 2.5 * dpr)

            if (currentCombo === 3) {
                playPerfectSound()
                spawnFloatingText(impactX, impactY - 14 * dpr, 'PERFECT 3x COMBO!', amberColor, 1.3)
            } else if (currentCombo > 3 && currentCombo % 3 === 0) {
                playPerfectSound()
                spawnFloatingText(impactX, impactY - 14 * dpr, `PERFECT ${currentCombo}x!`, violetColor, 1.4)
            } else {
                playHitSound(currentCombo)
                spawnFloatingText(impactX, impactY - 8 * dpr, `+${pointsEarned}`, azureColor, 1)
            }

            // Power-up drops
            if (Math.random() < 0.12 && powerUps.length < 3) {
                const roll = Math.random()
                if (roll < 0.45) {
                    powerUps.push({
                        x: impactX,
                        y: impactY,
                        vy: 2.2 * dpr,
                        type: 'triples',
                        label: '3x BALLS',
                        color: azureColor
                    })
                } else if (roll < 0.75) {
                    powerUps.push({
                        x: impactX,
                        y: impactY,
                        vy: 2.2 * dpr,
                        type: 'wide',
                        label: 'WIDE PADDLE',
                        color: violetColor
                    })
                } else {
                    powerUps.push({
                        x: impactX,
                        y: impactY,
                        vy: 2.2 * dpr,
                        type: 'fire',
                        label: 'FIRE BALL',
                        color: amberColor
                    })
                }
            }

            if (destroyedRef.current >= totalBricksRef.current) {
                isPlayingRef.current = false
                setIsPlaying(false)
                setGameWon(true)
                playPerfectSound()
            }
        }

        const render = () => {
            time += 0.02
            if (screenShake > 0.05) screenShake *= 0.88
            else screenShake = 0

            ctx.save()
            if (screenShake > 0) {
                const sx = (Math.random() - 0.5) * screenShake
                const sy = (Math.random() - 0.5) * screenShake
                ctx.translate(sx, sy)
            }

            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, width, height)

            if (widePaddleTimer > 0) {
                widePaddleTimer--
                paddleW = paddleBaseW * 1.55
            } else {
                paddleW = paddleBaseW
            }

            if (fireBallTimer > 0) fireBallTimer--

            if (paddleTargetXRef.current !== null) {
                paddleX += (paddleTargetXRef.current - paddleX) * 0.32
                const halfW = paddleW / 2
                paddleX = Math.max(halfW, Math.min(width - halfW, paddleX))
            }

            // Power-ups
            for (let i = powerUps.length - 1; i >= 0; i--) {
                const pu = powerUps[i]
                pu.y += pu.vy

                if (
                    pu.y >= paddleY - paddleH &&
                    pu.y <= paddleY + paddleH &&
                    pu.x >= paddleX - paddleW / 2 - 12 * dpr &&
                    pu.x <= paddleX + paddleW / 2 + 12 * dpr
                ) {
                    playPowerUpSound()
                    spawnFloatingText(paddleX, paddleY - 20 * dpr, `POWERUP: ${pu.label}!`, pu.color, 1.2)

                    if (pu.type === 'triples') {
                        const primary = balls[0] || { x: paddleX, y: paddleY - 20, vx: 0, vy: -5, r: ballR }
                        const speed = ballBaseSpeed * 1.05
                        balls.push({
                            x: primary.x,
                            y: primary.y,
                            vx: -speed * 0.7,
                            vy: -speed * 0.7,
                            r: ballR,
                            stuck: false,
                            trail: []
                        })
                        balls.push({
                            x: primary.x,
                            y: primary.y,
                            vx: speed * 0.7,
                            vy: -speed * 0.7,
                            r: ballR,
                            stuck: false,
                            trail: []
                        })
                    } else if (pu.type === 'wide') {
                        widePaddleTimer = 600
                    } else if (pu.type === 'fire') {
                        fireBallTimer = 450
                    }

                    powerUps.splice(i, 1)
                    continue
                }

                if (pu.y > height) {
                    powerUps.splice(i, 1)
                    continue
                }

                ctx.fillStyle = pu.color
                ctx.beginPath()
                ctx.roundRect(pu.x - 28 * dpr, pu.y - 8 * dpr, 56 * dpr, 16 * dpr, 8 * dpr)
                ctx.fill()

                ctx.fillStyle = whiteColor
                ctx.font = `600 ${Math.round(8 * dpr)}px monospace`
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText(pu.label, pu.x, pu.y)
            }

            // Balls physics
            if (isPlayingRef.current) {
                for (let bIdx = balls.length - 1; bIdx >= 0; bIdx--) {
                    const b = balls[bIdx]

                    if (b.stuck) {
                        b.x = paddleX
                        b.y = paddleY - paddleH / 2 - b.r - 1
                    } else {
                        b.trail.push({ x: b.x, y: b.y, r: b.r, alpha: 0.6 })
                        if (b.trail.length > 7) b.trail.shift()

                        b.x += b.vx
                        b.y += b.vy

                        if (b.x - b.r < 0) {
                            b.x = b.r
                            b.vx = -b.vx
                            playTone(220, 'sine', 0.05, 0.08)
                        } else if (b.x + b.r > width) {
                            b.x = width - b.r
                            b.vx = -b.vx
                            playTone(220, 'sine', 0.05, 0.08)
                        }

                        if (b.y - b.r < 0) {
                            b.y = b.r
                            b.vy = -b.vy
                            playTone(240, 'sine', 0.05, 0.08)
                        }

                        // Paddle Collision
                        const pTop = paddleY - paddleH / 2
                        const pBottom = paddleY + paddleH / 2
                        const pLeft = paddleX - paddleW / 2
                        const pRight = paddleX + paddleW / 2

                        if (
                            b.y + b.r >= pTop &&
                            b.y - b.r <= pBottom &&
                            b.x >= pLeft &&
                            b.x <= pRight &&
                            b.vy > 0
                        ) {
                            comboRef.current = 0
                            setActiveCombo(0)

                            const hitOffset = (b.x - paddleX) / (paddleW / 2)
                            const maxAngle = Math.PI * 0.42
                            const speed = Math.hypot(b.vx, b.vy)
                            b.vx = Math.sin(hitOffset * maxAngle) * speed
                            b.vy = -Math.cos(hitOffset * maxAngle) * speed
                            b.y = pTop - b.r - 1
                            playPaddleSound()
                            spawnShockwave(b.x, pTop, azureColor)
                        }

                        // Micro-Dots Collision
                        const ballCol = Math.floor(b.x / cellPx)
                        const ballRow = Math.floor(b.y / cellPx)

                        let hitTarget = false
                        let hitCol = ballCol
                        let hitRow = ballRow

                        for (let r = Math.max(0, ballRow - 1); r <= Math.min(rows - 1, ballRow + 1); r++) {
                            for (let c = Math.max(0, ballCol - 1); c <= Math.min(cols - 1, ballCol + 1); c++) {
                                const idx = r * cols + c
                                if (grid[idx] > 0) {
                                    const dotCenterX = (c + 0.5) * cellPx
                                    const dotCenterY = (r + 0.5) * cellPx
                                    const dist = Math.hypot(b.x - dotCenterX, b.y - dotCenterY)

                                    if (dist < b.r + cellPx * 0.7) {
                                        hitTarget = true
                                        hitCol = c
                                        hitRow = r
                                        break
                                    }
                                }
                            }
                            if (hitTarget) break
                        }

                        if (hitTarget) {
                            const prevX = b.x - b.vx
                            const prevY = b.y - b.vy
                            const prevCol = Math.floor(prevX / cellPx)
                            const prevRow = Math.floor(prevY / cellPx)

                            if (prevCol !== hitCol) b.vx = -b.vx
                            if (prevRow !== hitRow) b.vy = -b.vy

                            clear3Cluster(hitCol, hitRow, b.x, b.y)
                        }

                        if (b.y - b.r > height) {
                            balls.splice(bIdx, 1)

                            if (balls.length === 0) {
                                livesRef.current--
                                setLives(livesRef.current)
                                comboRef.current = 0
                                setActiveCombo(0)
                                playTone(160, 'sawtooth', 0.25, 0.2)

                                if (livesRef.current <= 0) {
                                    isPlayingRef.current = false
                                    setIsPlaying(false)
                                    setGameOver(true)
                                } else {
                                    const newBall: Ball = {
                                        x: paddleX,
                                        y: paddleY - paddleH / 2 - ballR - 1,
                                        vx: 0,
                                        vy: 0,
                                        r: ballR,
                                        stuck: true,
                                        trail: []
                                    }
                                    balls.push(newBall)
                                    resetSingleBall(newBall)
                                }
                            }
                        }
                    }
                }
            }

            // Background Ambient Grid
            if (pointerInside) {
                const px = pointerClientX * dpr
                const py = pointerClientY * dpr
                const gridR = 140 * dpr
                const gridR2 = gridR * gridR

                const minC = Math.max(0, Math.floor((px - gridR) / cellPx))
                const maxC = Math.min(cols - 1, Math.ceil((px + gridR) / cellPx))
                const minR = Math.max(0, Math.floor((py - gridR) / cellPx))
                const maxR = Math.min(rows - 1, Math.ceil((py + gridR) / cellPx))

                ctx.fillStyle = gridDotColor

                for (let r = minR; r <= maxR; r++) {
                    const cy = (r + 0.5) * cellPx
                    const dy = cy - py
                    for (let c = minC; c <= maxC; c++) {
                        if (grid[r * cols + c] > 0) continue
                        const cx = (c + 0.5) * cellPx
                        const dx = cx - px
                        const d2 = dx * dx + dy * dy
                        if (d2 < gridR2) {
                            ctx.globalAlpha = (1 - Math.sqrt(d2) / gridR) * 0.4
                            ctx.fillRect(cx - 1, cy - 1, 2, 2)
                        }
                    }
                }
                ctx.globalAlpha = 1
            }

            // Draw SAHARA LABS Micro-Dots
            const dotSizeRatio = 0.58
            const dotPx = Math.max(1.5, Math.round(cellPx * dotSizeRatio))
            const dotOffset = Math.floor((cellPx - dotPx) / 2)

            for (let r = 0; r < rows; r++) {
                const rowOffset = r * cols
                const py = r * cellPx + dotOffset

                for (let c = 0; c < cols; c++) {
                    const lvl = grid[rowOffset + c]
                    if (lvl === 0) continue

                    const px = c * cellPx + dotOffset

                    let fill = colors[lvl - 1] || inkColor
                    if (!isPlayingRef.current) {
                        const u = c / cols
                        const v = r / rows
                        const shimmer = 0.7 + 0.3 * Math.sin(3.5 * u - 1.2 * time + 2 * Math.sin(2.5 * v))
                        if (shimmer > 0.88) {
                            fill = azureColor
                        }
                    }

                    ctx.fillStyle = fill
                    ctx.fillRect(px, py, dotPx, dotPx)
                }
            }

            // Shockwaves
            for (let i = shockwaves.length - 1; i >= 0; i--) {
                const sw = shockwaves[i]
                sw.r += 2.2 * dpr
                sw.alpha -= 0.05

                if (sw.alpha <= 0) {
                    shockwaves.splice(i, 1)
                    continue
                }

                ctx.save()
                ctx.globalAlpha = sw.alpha
                ctx.strokeStyle = sw.color
                ctx.lineWidth = 2 * dpr
                ctx.beginPath()
                ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2)
                ctx.stroke()
                ctx.restore()
            }

            // Micro Explosion Particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i]
                p.x += p.vx
                p.y += p.vy
                p.vy += 0.09 * dpr
                p.life -= 1 / p.maxLife

                if (p.life <= 0) {
                    particles.splice(i, 1)
                    continue
                }

                ctx.globalAlpha = p.life
                ctx.fillStyle = p.color
                ctx.fillRect(p.x, p.y, p.size, p.size)
            }
            ctx.globalAlpha = 1

            // Balls & Trails
            if (isPlayingRef.current) {
                balls.forEach(b => {
                    b.trail.forEach((t, tIdx) => {
                        const tAlpha = (tIdx / b.trail.length) * 0.45
                        ctx.globalAlpha = tAlpha
                        ctx.fillStyle = fireBallTimer > 0 ? amberColor : azureColor
                        ctx.beginPath()
                        ctx.arc(t.x, t.y, t.r * (0.4 + (tIdx / b.trail.length) * 0.6), 0, Math.PI * 2)
                        ctx.fill()
                    })
                    ctx.globalAlpha = 1

                    ctx.fillStyle = fireBallTimer > 0 ? amberColor : azureColor
                    ctx.beginPath()
                    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
                    ctx.fill()

                    ctx.fillStyle = whiteColor
                    ctx.beginPath()
                    ctx.arc(b.x - 1, b.y - 1, b.r * 0.45, 0, Math.PI * 2)
                    ctx.fill()
                })

                // Paddle
                const paddleColor = widePaddleTimer > 0 ? violetColor : inkColor
                ctx.fillStyle = paddleColor
                ctx.beginPath()
                ctx.roundRect(
                    paddleX - paddleW / 2,
                    paddleY - paddleH / 2,
                    paddleW,
                    paddleH,
                    paddleH / 2
                )
                ctx.fill()

                ctx.fillStyle = widePaddleTimer > 0 ? whiteColor : azureColor
                ctx.beginPath()
                ctx.arc(paddleX, paddleY, paddleH * 0.38, 0, Math.PI * 2)
                ctx.fill()
            }

            // Floating Text Callouts
            for (let i = floatingTexts.length - 1; i >= 0; i--) {
                const ft = floatingTexts[i]
                ft.y += ft.vy
                ft.life -= 1 / ft.maxLife

                if (ft.life <= 0) {
                    floatingTexts.splice(i, 1)
                    continue
                }

                ctx.save()
                ctx.globalAlpha = ft.life
                ctx.font = `800 ${Math.round(13 * dpr * ft.scale)}px 'Host Grotesk', sans-serif`
                ctx.textAlign = 'center'
                ctx.fillStyle = ft.color
                ctx.fillText(ft.text, ft.x, ft.y)
                ctx.restore()
            }

            ctx.restore()
            animId = requestAnimationFrame(render)
        }

        const onPointerMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect()
            pointerInside = true
            pointerClientX = e.clientX - rect.left
            pointerClientY = e.clientY - rect.top
            paddleTargetXRef.current = pointerClientX * dpr
        }

        const onTouchMove = (e: TouchEvent) => {
            if (!e.touches[0]) return
            const rect = canvas.getBoundingClientRect()
            const touch = e.touches[0]
            pointerInside = true
            pointerClientX = touch.clientX - rect.left
            pointerClientY = touch.clientY - rect.top
            paddleTargetXRef.current = pointerClientX * dpr
        }

        const onPointerLeave = () => {
            pointerInside = false
        }

        const onClick = () => {
            if (!isPlayingRef.current) {
                startGame()
            } else {
                launchAllBalls()
            }
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                paddleTargetXRef.current = Math.max(paddleW / 2, (paddleTargetXRef.current || paddleX) - 40 * dpr)
            } else if (e.key === 'ArrowRight') {
                paddleTargetXRef.current = Math.min(width - paddleW / 2, (paddleTargetXRef.current || paddleX) + 40 * dpr)
            } else if (e.key === ' ' || e.key === 'Enter') {
                if (!isPlayingRef.current) startGame()
                else launchAllBalls()
            } else if (e.key === 'f' || e.key === 'F') {
                setIsFullViewport(prev => !prev)
            } else if (e.key === 'Escape') {
                if (isFullViewportRef.current) {
                    setIsFullViewport(false)
                } else if (isPlayingRef.current) {
                    isPlayingRef.current = false
                    setIsPlaying(false)
                }
            }
        }

        initBoard()
        animId = requestAnimationFrame(render)

        const ro = new ResizeObserver(() => {
            initBoard()
        })
        ro.observe(canvas)

        canvas.addEventListener('mousemove', onPointerMove)
        canvas.addEventListener('mouseleave', onPointerLeave)
        canvas.addEventListener('touchmove', onTouchMove, { passive: true })
        canvas.addEventListener('click', onClick)
        window.addEventListener('keydown', onKeyDown)

        return () => {
            cancelAnimationFrame(animId)
            ro.disconnect()
            canvas.removeEventListener('mousemove', onPointerMove)
            canvas.removeEventListener('mouseleave', onPointerLeave)
            canvas.removeEventListener('touchmove', onTouchMove)
            canvas.removeEventListener('click', onClick)
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [isFullViewport])

    const handleStart = useCallback(() => {
        triggerStartRef.current()
    }, [])

    const handleReset = useCallback(() => {
        triggerResetRef.current()
    }, [])

    const toggleFullViewport = useCallback(() => {
        setIsFullViewport(prev => !prev)
    }, [])

    const gameContent = (
        <div
            ref={containerRef}
            className={`relative size-full overflow-hidden select-none transition-all duration-300 ${
                isFullViewport
                    ? 'fixed inset-0 z-[99999] h-screen w-screen bg-white'
                    : ''
            } ${className || ''}`}
        >
            <canvas ref={canvasRef} className='block size-full cursor-crosshair' />

            {/* Top HUD when playing */}
            {isPlaying && (
                <div className='absolute top-4 inset-x-4 sm:inset-x-8 z-20 flex items-center justify-between pointer-events-none'>
                    <div className='flex items-center gap-4 sm:gap-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-line shadow-xs font-mono text-xs'>
                        <span className='font-semibold text-ink'>
                            SCORE: <span className='text-azure-600'>{score.toString().padStart(4, '0')}</span>
                        </span>

                        <div className='flex items-center gap-1.5 text-muted-foreground'>
                            <span>LIVES:</span>
                            <div className='flex items-center gap-1'>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Heart
                                        key={i}
                                        className={`size-3.5 ${
                                            i < lives ? 'fill-azure-600 text-azure-600' : 'text-line'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {activeCombo >= 2 && (
                            <span className='inline-flex items-center gap-1 text-amber-500 font-bold animate-pulse'>
                                <Zap className='size-3 fill-current' />
                                {activeCombo}x COMBO
                            </span>
                        )}

                        <span className='hidden md:inline text-muted-foreground'>
                            CLEARED:{' '}
                            <span className='text-ink font-semibold'>
                                {totalBricks > 0 ? Math.round((destroyedCount / totalBricks) * 100) : 0}%
                            </span>
                        </span>
                    </div>

                    <div className='flex items-center gap-2 pointer-events-auto'>
                        <button
                            type='button'
                            onClick={() => setIsMuted(!isMuted)}
                            className='inline-flex items-center justify-center size-8 rounded-full border border-line bg-white/90 text-ink hover:border-azure-500 hover:text-azure-600 backdrop-blur-md transition-colors'
                            title={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted ? <VolumeX className='size-3.5' /> : <Volume2 className='size-3.5' />}
                        </button>

                        <button
                            type='button'
                            onClick={toggleFullViewport}
                            className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line bg-white/90 text-xs font-mono text-ink hover:border-azure-500 hover:text-azure-600 backdrop-blur-md transition-colors'
                            title={isFullViewport ? 'Exit Full Viewport (Esc)' : 'Full Viewport (F)'}
                        >
                            {isFullViewport ? (
                                <>
                                    <Minimize2 className='size-3' />
                                    <span className='hidden sm:inline'>Exit Viewport</span>
                                </>
                            ) : (
                                <>
                                    <Maximize2 className='size-3' />
                                    <span className='hidden sm:inline'>Full Viewport</span>
                                </>
                            )}
                        </button>

                        <button
                            type='button'
                            onClick={handleReset}
                            className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line bg-white/90 text-xs font-mono text-ink hover:border-azure-500 hover:text-azure-600 backdrop-blur-md transition-colors'
                            title='Restart'
                        >
                            <RotateCcw className='size-3' />
                            <span className='hidden sm:inline'>Restart</span>
                        </button>

                        {onExit && !isFullViewport && (
                            <button
                                type='button'
                                onClick={onExit}
                                className='inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-line bg-white/90 text-xs font-mono text-ink hover:border-azure-500 hover:text-azure-600 backdrop-blur-md transition-colors'
                                title='Exit game'
                            >
                                <X className='size-3' />
                                <span className='hidden sm:inline'>Exit</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Idle Banner: Click to Play + Viewport Expand */}
            {!isPlaying && !gameOver && !gameWon && (
                <div className='absolute bottom-6 inset-x-4 z-20 flex flex-wrap items-center justify-center gap-3 pointer-events-none'>
                    <button
                        type='button'
                        onClick={handleStart}
                        className='pointer-events-auto group inline-flex items-center gap-2.5 rounded-full border border-ink/20 bg-white/95 px-6 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-ink shadow-[0_12px_30px_-10px_rgba(8,8,8,0.2)] backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-azure-500 hover:bg-azure-600 hover:text-white'
                    >
                        <Play className='size-3.5 fill-current text-azure-600 group-hover:text-white transition-colors' />
                        <span>Play Sahara Breakout (Clear 3 At A Turn)</span>
                    </button>

                    <button
                        type='button'
                        onClick={toggleFullViewport}
                        className='pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white/90 px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground backdrop-blur-md transition-all hover:border-ink hover:text-ink'
                    >
                        {isFullViewport ? <Minimize2 className='size-3' /> : <Maximize2 className='size-3' />}
                        <span>{isFullViewport ? 'Exit Full Viewport' : 'Take Full Viewport'}</span>
                    </button>
                </div>
            )}

            {/* Game Over Modal Overlay */}
            {gameOver && (
                <div className='absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md p-6 text-center animate-in fade-in zoom-in-95 duration-200'>
                    <p className='font-mono text-xs uppercase tracking-[0.18em] text-destructive'>Game Over</p>
                    <h3 className='mt-2 text-4xl font-semibold tracking-[-0.03em] text-ink'>
                        Final Score: {score}
                    </h3>
                    <p className='mt-2 max-w-xs text-sm text-muted-foreground'>
                        You cleared {totalBricks > 0 ? Math.round((destroyedCount / totalBricks) * 100) : 0}% of
                        the Sahara Labs pixel matrix with 3-brick blast clusters.
                    </p>
                    <div className='mt-6 flex items-center gap-3'>
                        <button
                            type='button'
                            onClick={handleReset}
                            className='inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-azure-600'
                        >
                            <RotateCcw className='size-3.5' />
                            Play Again
                        </button>
                        {isFullViewport && (
                            <button
                                type='button'
                                onClick={toggleFullViewport}
                                className='inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink'
                            >
                                Exit Full Viewport
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Game Won Modal Overlay */}
            {gameWon && (
                <div className='absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md p-6 text-center animate-in fade-in zoom-in-95 duration-200'>
                    <div className='size-14 rounded-full bg-azure-500/10 text-azure-600 flex items-center justify-center mb-3'>
                        <Trophy className='size-7' />
                    </div>
                    <p className='font-mono text-xs uppercase tracking-[0.18em] text-azure-600'>Matrix Cleared!</p>
                    <h3 className='mt-2 text-4xl font-semibold tracking-[-0.03em] text-ink'>
                        Perfect Victory! Score: {score}
                    </h3>
                    <p className='mt-2 max-w-sm text-sm text-muted-foreground'>
                        Incredible precision! You decoded and shattered all micro-dots across the full matrix!
                    </p>
                    <div className='mt-6 flex items-center gap-3'>
                        <button
                            type='button'
                            onClick={handleReset}
                            className='inline-flex items-center gap-2 rounded-full bg-azure-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-azure-700'
                        >
                            <RotateCcw className='size-3.5' />
                            Play Again
                        </button>
                        {isFullViewport && (
                            <button
                                type='button'
                                onClick={toggleFullViewport}
                                className='inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink'
                            >
                                Exit Full Viewport
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )

    if (isFullViewport && mounted && typeof document !== 'undefined') {
        return createPortal(gameContent, document.body)
    }

    return gameContent
}
