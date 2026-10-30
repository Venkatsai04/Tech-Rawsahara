import type { FC, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useInView } from '@/hooks/use-in-view'

interface CountUpProps {
    to: number
    duration?: number
    className?: string
}

export const CountUp: FC<CountUpProps> = ({ to, duration = 1200, className }): ReactNode => {
    const ref = useRef<HTMLSpanElement>(null)
    const inView = useInView(ref)
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!inView) return
        let start = 0
        const step = (timestamp: number) => {
            if (!start) start = timestamp
            const progress = Math.min((timestamp - start) / duration, 1)
            setCount(Math.floor(progress * to))
            if (progress < 1) {
                requestAnimationFrame(step)
            }
        }
        requestAnimationFrame(step)
    }, [inView, to, duration])

    return (
        <span ref={ref} className={className}>
            {count}
        </span>
    )
}
