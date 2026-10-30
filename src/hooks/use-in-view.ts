import { useEffect, useState, type RefObject } from 'react'

export interface UseInViewOptions {
    once?: boolean
    rootMargin?: string
    threshold?: number | number[]
}

export const useInView = (
    ref: RefObject<Element | null>,
    { once = true, rootMargin = '0px 0px -12% 0px', threshold = 0 }: UseInViewOptions = {}
): boolean => {
    const [inView, setInView] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        if (typeof IntersectionObserver === 'undefined') {
            setInView(true)
            return
        }

        const observer = new IntersectionObserver(
            entries => {
                const entry = entries[0]
                if (entry && entry.isIntersecting) {
                    setInView(true)
                    if (once) observer.disconnect()
                } else if (!once) {
                    setInView(false)
                }
            },
            { rootMargin, threshold }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [ref, once, rootMargin, threshold])

    return inView
}
