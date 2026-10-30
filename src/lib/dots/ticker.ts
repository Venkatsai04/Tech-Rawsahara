type TickCallback = (now: number) => void

const callbacks = new Set<TickCallback>()
let rafId = 0

const loop = (now: number): void => {
    rafId = 0
    callbacks.forEach(cb => cb(now))
    if (callbacks.size > 0 && !rafId) {
        rafId = requestAnimationFrame(loop)
    }
}

export const subscribeTick = (cb: TickCallback): (() => void) => {
    callbacks.add(cb)
    if (!rafId) {
        rafId = requestAnimationFrame(loop)
    }
    return () => {
        callbacks.delete(cb)
        if (callbacks.size === 0 && rafId) {
            cancelAnimationFrame(rafId)
            rafId = 0
        }
    }
}
