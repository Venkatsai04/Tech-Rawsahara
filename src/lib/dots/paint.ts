import { DOT_LEVELS } from './palette'

const BAYER_4X4 = [
    0, 8, 2, 10,
    12, 4, 14, 6,
    3, 11, 1, 9,
    15, 7, 13, 5
]

const NUM_LEVELS = DOT_LEVELS.length

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v)

export const smoothstep = (min: number, max: number, value: number): number => {
    const x = clamp01((value - min) / (max - min))
    return x * x * (3 - 2 * x)
}

export const createGridLayer = (
    width: number,
    height: number,
    cols: number,
    rows: number,
    cellPx: number,
    color: string
): HTMLCanvasElement | null => {
    if (typeof document === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const size = Math.max(1, Math.round(0.14 * cellPx))
    const offset = Math.floor((cellPx - size) / 2)

    ctx.fillStyle = color
    ctx.beginPath()

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            ctx.rect(c * cellPx + offset, r * cellPx + offset, size, size)
        }
    }

    ctx.fill()
    return canvas
}

export const toLevel = (value: number, col: number, row: number): number => {
    if (value >= 0.14) {
        const level = 2 + Math.floor(((value - 0.14) / 0.86) * (NUM_LEVELS - 1))
        return level > NUM_LEVELS ? NUM_LEVELS : level
    }
    if (value <= 0.015) return 0

    const bayerIndex = ((row & 3) << 2) | (col & 3)
    const threshold = (BAYER_4X4[bayerIndex] + 0.5) / 16
    return value / 0.14 > threshold ? 1 : 0
}

export const paintDots = (
    ctx: CanvasRenderingContext2D,
    levels: Uint8Array,
    cols: number,
    rows: number,
    cellPx: number,
    colors: string[]
): void => {
    for (let lvl = 1; lvl <= NUM_LEVELS; lvl++) {
        const size = Math.max(1, Math.round(cellPx * DOT_LEVELS[lvl - 1].size))
        const offset = Math.floor((cellPx - size) / 2)
        let hasPoints = false

        ctx.beginPath()

        for (let r = 0, idx = 0; r < rows; r++) {
            const y = r * cellPx + offset
            for (let c = 0; c < cols; c++, idx++) {
                if (levels[idx] === lvl) {
                    ctx.rect(c * cellPx + offset, y, size, size)
                    hasPoints = true
                }
            }
        }

        if (hasPoints) {
            ctx.fillStyle = colors[lvl - 1]
            ctx.fill()
        }
    }
}
