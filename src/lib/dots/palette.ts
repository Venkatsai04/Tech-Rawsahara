export interface DotLevel {
    size: number
    color: string
}

export const DOT_LEVELS: DotLevel[] = [
    { size: 0.24, color: '--azure-200' },
    { size: 0.34, color: '--azure-200' },
    { size: 0.46, color: '--azure-300' },
    { size: 0.58, color: '--azure-400' },
    { size: 0.70, color: '--azure-500' },
    { size: 0.82, color: '--azure-600' }
]

const FALLBACKS: Record<string, string> = {
    '--grid-dot': '#e2dded',
    '--azure-200': '#ddccff',
    '--azure-300': '#c19dff',
    '--azure-400': '#9a5cfb',
    '--azure-500': '#6a00f5',
    '--azure-600': '#5700cc'
}

export const readCssColor = (name: string): string => {
    if (typeof document === 'undefined') return FALLBACKS[name] ?? '#6a00f5'
    const fallback = FALLBACKS[name] ?? '#6a00f5'
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

export const readDotColors = (): string[] => {
    return DOT_LEVELS.map(level => readCssColor(level.color))
}
