import { clamp01, smoothstep } from './paint'
import { createNoise3D, createRandom } from './noise'

export interface DotFieldPrepareOptions {
    cols: number
    rows: number
    cellPx?: number
    width?: number
    height?: number
}

export interface DotField {
    (u: number, v: number, time: number, col: number, row: number): number
    prepare?: (options: DotFieldPrepareOptions) => void
}

interface RibbonConfig {
    angle: number
    length: number
    width: number
    offset: number
    waveAmp: [number, number]
    waveFreq: [number, number]
    waveSpeed: [number, number]
    twistFreq: number
    twistSpeed: number
    phase: number
    strength: number
}

const prepareRibbon = (r: RibbonConfig) => ({
    ...r,
    cos: Math.cos(r.angle),
    sin: Math.sin(r.angle),
    reach: Math.abs(r.waveAmp[0]) + Math.abs(r.waveAmp[1]) + r.width + 0.12
})

// Silk Field for Hero ribbons and SilkDrift
export const createSilkField = (seed: number = 3, tilt: number = 0): DotField => {
    const noise = createNoise3D(seed)
    const ribbons = [
        prepareRibbon({
            angle: -0.62 + tilt,
            length: 0.86,
            width: 0.2,
            offset: 0,
            waveAmp: [0.11, 0.04],
            waveFreq: [2.6, 5.9],
            waveSpeed: [0.36, -0.58],
            twistFreq: 2.1,
            twistSpeed: 0.28,
            phase: 0,
            strength: 1
        }),
        prepareRibbon({
            angle: -0.48 + tilt,
            length: 0.66,
            width: 0.11,
            offset: 0.1,
            waveAmp: [0.12, 0.03],
            waveFreq: [1.9, 6.8],
            waveSpeed: [-0.28, 0.46],
            twistFreq: 2.9,
            twistSpeed: -0.4,
            phase: 2.1,
            strength: 0.78
        })
    ]

    return (u: number, v: number, time: number): number => {
        let inside = false
        for (let i = 0; i < ribbons.length; i++) {
            const rb = ribbons[i]
            const par = u * rb.cos + v * rb.sin
            const perp = -u * rb.sin + v * rb.cos - rb.offset
            if (Math.abs(par) < rb.length + 0.12 && Math.abs(perp) < rb.reach) {
                inside = true
                break
            }
        }
        if (!inside) return 0

        const n1 = noise(1.25 * u, 1.25 * v, 0.1 * time)
        const n2 = noise(3.2 * u + 11.7, 3.2 * v - 4.3, 0.2 * time)
        let maxVal = 0

        for (let i = 0; i < ribbons.length; i++) {
            const rb = ribbons[i]
            const par = u * rb.cos + v * rb.sin
            const perp = -u * rb.sin + v * rb.cos
            const uNorm = Math.abs(par + 0.1 * n1) / rb.length
            if (uNorm >= 1) continue

            const wave =
                rb.offset +
                rb.waveAmp[0] * Math.sin(par * rb.waveFreq[0] + time * rb.waveSpeed[0] + rb.phase) +
                rb.waveAmp[1] * Math.sin(par * rb.waveFreq[1] + time * rb.waveSpeed[1] + 1.7 * rb.phase) +
                0.06 * n1

            const twist = par * rb.twistFreq - time * rb.twistSpeed + rb.phase + 0.7 * n1
            const twistCos = Math.abs(Math.cos(twist))
            const vNorm = (perp - wave + 0.028 * n2) / (rb.width * (1 - uNorm * uNorm) * (0.16 + 0.84 * twistCos))
            const vAbs = Math.abs(vNorm)
            if (vAbs >= 1) continue

            const val =
                (1 - smoothstep(0.55, 1, vAbs)) *
                clamp01(0.5 + 0.38 * vNorm * Math.sin(twist) + 0.34 * (1 - twistCos)) *
                (1 - smoothstep(0.6, 1, uNorm)) *
                rb.strength

            if (val > maxVal) maxVal = val
        }

        return maxVal
    }
}

// Globe Field for Lead Generation Systems
export const createGlobeField = (seed: number = 11): DotField => {
    const noise = createNoise3D(seed)
    return (u: number, v: number, time: number): number => {
        const radius = Math.sqrt(u * u + v * v)
        if (radius >= 0.38) {
            const rx = u / 0.608
            const ry = (v + 0.18 * u) / 0.1596
            const ringDist = 1 - Math.abs(Math.sqrt(rx * rx + ry * ry) - 1) / 0.16
            const t = 0.6 * time
            const px = 0.38 * Math.cos(t) * 1.6
            const py = 0.38 * Math.sin(t) * 0.42 - 0.18 * px
            const dx = u - px
            const dy = v - py
            return Math.max(ringDist > 0 ? 0.42 * ringDist : 0, Math.exp(-(dx * dx + dy * dy) / 0.0014))
        }

        const su = u / 0.38
        const sv = v / 0.38
        const sz = Math.sqrt(Math.max(0, 1 - su * su - sv * sv))
        const cu = 0.3894183423086505 * sv + 0.9210609940028851 * sz
        const rot = 0.32 * time
        const cosR = Math.cos(rot)
        const sinR = Math.sin(rot)
        const val = noise(
            1.7 * (su * cosR + cu * sinR),
            1.7 * (0.9210609940028851 * sv - 0.3894183423086505 * sz),
            1.7 * (cu * cosR - su * sinR)
        )
        const lit = Math.max(0, -0.52 * su + -0.56 * sv + 0.64 * sz)
        return Math.max(val > 0.08 ? 0.42 + 0.58 * lit : 0.08 + 0.22 * lit, 0.3 * smoothstep(0.82, 1, radius / 0.38))
    }
}

// Stream Field for AI Workflow Automation
export const createStreamField = (seed: number = 5): DotField => {
    const random = createRandom(seed)
    const speeds = new Float32Array(64)
    const offsets = new Float32Array(64)
    const freqs = new Float32Array(64)
    const widths = new Float32Array(64)
    const strengths = new Float32Array(64)

    for (let i = 0; i < 64; i++) {
        speeds[i] = 0.12 + 0.42 * random()
        offsets[i] = 10 * random()
        freqs[i] = 0.9 + 1.8 * random()
        widths[i] = 0.18 + 0.42 * random()
        strengths[i] = 0.55 + 0.45 * random()
    }

    let cols = 1

    const field: DotField = (u: number, v: number, time: number, col: number, row: number): number => {
        if (row % 2 === 1) return 0
        const lane = (row >> 1) % 64
        const edgeDist = Math.min(col, cols - 1 - col)
        const edgeFade = edgeDist >= 6 ? 1 : Math.max(0, edgeDist) / 6
        const pos = u * freqs[lane] - time * speeds[lane] + offsets[lane]
        const frac = pos - Math.floor(pos)

        return frac > widths[lane]
            ? 0.03 * edgeFade
            : (0.28 + 0.72 * (frac / widths[lane])) * strengths[lane] * edgeFade
    }

    field.prepare = options => {
        cols = options.cols
    }

    return field
}

// Voice Field for AI Voice Agents
export const createVoiceField = (seed: number = 7): DotField => {
    const noise = createNoise3D(seed)
    let cols = 1
    let rows = 1

    const field: DotField = (u: number, v: number, time: number, col: number, row: number): number => {
        if (col % 2 === 1) return 0
        const normCol = (col + 0.5) / cols
        const edgeDist = Math.min(normCol, 1 - normCol)
        if (edgeDist < 0.06) return 0

        const edgeFade = smoothstep(0.06, 0.32, edgeDist)
        const pulse = 0.55 + 0.45 * Math.sin(0.9 * time + 2 * Math.sin(0.37 * time))
        const amp = Math.max(
            0.6,
            clamp01((0.5 + 0.5 * noise(0.09 * col, 0.55 * time, 0)) * 1.15) *
                edgeFade *
                (0.35 + 0.65 * pulse) *
                rows *
                0.44
        )
        const distFromCenter = Math.abs(row + 0.5 - rows / 2)
        return distFromCenter > amp ? 0 : 0.35 + 0.65 * (1 - distFromCenter / (amp + 0.5))
    }

    field.prepare = options => {
        cols = options.cols
        rows = options.rows
    }

    return field
}

// Ripple Field for Customer Support Systems
export const createRippleField = (): DotField => {
    return (u: number, v: number, time: number): number => {
        const o1x = -0.34 + 0.06 * Math.sin(0.37 * time)
        const o1y = 0.05 * Math.cos(0.29 * time)
        const o2x = 0.34 + 0.05 * Math.cos(0.31 * time)
        const o2y = -0.06 * Math.sin(0.43 * time)

        const d1 = Math.sqrt((u - o1x) * (u - o1x) + (v - o1y) * (v - o1y))
        const d2 = Math.sqrt((u - o2x) * (u - o2x) + (v - o2y) * (v - o2y))

        const waves = 0.5 + 0.25 * (Math.cos(32 * d1 - 2.4 * time) + Math.cos(32 * d2 - 2.4 * time))
        return clamp01(waves * Math.exp(-(1.8 * (u * u * 0.7 + v * v * 2.4))) * 1.2)
    }
}

// Pipeline Field for The Studio journey
export const createPipelineField = (stops: number[], seed: number = 9): DotField => {
    const random = createRandom(seed)
    const stream = Array.from({ length: 7 }, (_, i) => ({
        spread: (i / 6) * 2 - 1,
        speed: 0.14 + 0.2 * random(),
        offset: random()
    }))

    let cols = 1
    let rows = 1
    let midRow = 0
    let nodeRadius = 2
    let nodeCols: number[] = []

    const decay = (dist: number, max: number): number => (dist >= 0 && dist < max ? 1 - dist / max : 0)

    const field: DotField = (u: number, v: number, time: number, col: number, row: number): number => {
        if (nodeCols.length < 2) return 0
        const first = nodeCols[0]
        const last = nodeCols[nodeCols.length - 1]
        const span = last - first
        const dy = Math.abs(row - midRow)
        const pPhase = (0.14 * time) % 1
        const packet1 = first + pPhase * span
        const packet2 = first + ((pPhase + 0.5) % 1) * span
        const denom = nodeRadius * nodeRadius * 2

        // Draw the 4 stage square matrix nodes
        for (let i = 0; i < nodeCols.length; i++) {
            const dx = Math.abs(col - nodeCols[i])
            if (dx > nodeRadius || dy > nodeRadius) continue

            const r1 = Math.max(
                Math.exp(-((packet1 - nodeCols[i]) ** 2) / denom),
                Math.exp(-((packet2 - nodeCols[i]) ** 2) / denom)
            )

            if (dx === nodeRadius || dy === nodeRadius) return 0.72 + 0.28 * r1
            const dNorm = Math.max(dx, dy) / nodeRadius
            if (dNorm < 0.34) return 0.55 + 0.45 * r1
            return ((col + row) % 2 === 0 ? 0.2 : 0.04) + 0.6 * r1 * (1 - dNorm)
        }

        // Connecting dotted line between nodes
        if (dy === 0 && col > first + nodeRadius && col < last - nodeRadius) {
            const p = Math.max(decay(packet1 - col, 7), decay(packet2 - col, 7))
            return Math.max(col % 2 === 0 ? 0.2 : 0.05, p)
        }

        // Incoming enquiry particles (left of first node)
        const leftLimit = first - nodeRadius
        if (col < leftLimit && leftLimit > 2) {
            const frac = col / leftLimit
            const fade = smoothstep(0, 0.12, frac)
            for (let i = 0; i < stream.length; i++) {
                const s = stream[i]
                const streamY = midRow + s.spread * rows * 0.4 * Math.pow(1 - frac, 1.4)
                if (Math.abs(row - streamY) < 0.5) {
                    return Math.max(
                        col % 2 === 0 ? 0.16 * fade : 0,
                        decay(((time * s.speed + s.offset) % 1) - frac, 0.16) * fade
                    )
                }
            }
            return 0
        }

        // Outgoing booked conversation dotted line (right of last node)
        if (dy === 0 && col > last + nodeRadius) {
            const outFrac = (col - last - nodeRadius) / Math.max(1, cols - last - nodeRadius)
            return (col % 2 === 0 ? 0.2 : 0.05) * (1 - outFrac)
        }

        return 0
    }

    field.prepare = options => {
        cols = options.cols
        rows = options.rows
        midRow = Math.floor(rows / 2)
        nodeRadius = Math.max(2, Math.round(0.15 * rows))
        nodeCols = stops.map(s => Math.round(s * cols))
    }

    return field
}

// Text Field for Footer SAHARA LABS wordmark
export const createTextField = (
    text: string,
    fontVariable: string = '--font-app-sans',
    fontWeight: number = 700
): DotField => {
    let alphaMap = new Float32Array(0)
    let cols = 0
    let rows = 0

    const field: DotField = (u: number, v: number, time: number, col: number, row: number): number => {
        if (col >= cols || row >= rows) return 0
        const alpha = alphaMap[row * cols + col]
        if (alpha <= 0.02) return 0
        return alpha * (0.6 + 0.4 * Math.sin(4.6 * u - 1.4 * time + 1.2 * Math.sin(3 * v + 0.5 * time)))
    }

    field.prepare = options => {
        cols = options.cols
        rows = options.rows
        alphaMap = new Float32Array(cols * rows)
        if (typeof document === 'undefined') return

        const offscreen = document.createElement('canvas')
        offscreen.width = cols
        offscreen.height = rows
        const ctx = offscreen.getContext('2d', { willReadFrequently: true })
        if (!ctx) return

        const fontFace = getComputedStyle(document.documentElement).getPropertyValue(fontVariable).trim() || 'sans-serif'
        ctx.font = `${fontWeight} 100px ${fontFace}`
        const m = ctx.measureText(text)
        const left = m.actualBoundingBoxLeft
        const ascent = m.actualBoundingBoxAscent
        const width = Math.max(1, left + m.actualBoundingBoxRight)
        const height = Math.max(1, ascent + m.actualBoundingBoxDescent)
        const scale = Math.min((0.98 * cols) / width, (0.84 * rows) / height)

        ctx.setTransform(scale, 0, 0, scale, (cols - width * scale) / 2 + left * scale, (rows - height * scale) / 2 + ascent * scale)
        ctx.fillStyle = '#000'
        ctx.fillText(text, 0, 0)

        const imgData = ctx.getImageData(0, 0, cols, rows).data
        for (let i = 0; i < alphaMap.length; i++) {
            alphaMap[i] = imgData[4 * i + 3] / 255
        }
    }

    return field
}
