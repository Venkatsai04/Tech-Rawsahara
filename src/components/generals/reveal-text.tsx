import type { ElementType, FC, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useInView } from '@/hooks/use-in-view'

interface RevealTextProps {
    lines: string[]
    as?: ElementType
    className?: string
    delay?: number
    stagger?: number
    immediate?: boolean
}

export const RevealText: FC<RevealTextProps> = ({
    lines,
    as: Component = 'h2',
    className,
    delay = 0,
    stagger = 60,
    immediate = false
}): ReactNode => {
    const ref = useRef<HTMLElement>(null)
    const inView = useInView(ref)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        if (!immediate) return
        const raf = requestAnimationFrame(() => setMounted(true))
        return () => cancelAnimationFrame(raf)
    }, [immediate])

    const active = immediate ? mounted : inView
    let wordIndex = 0

    return (
        <Component ref={ref} className={className}>
            <span className='sr-only'>{lines.join(' ')}</span>
            <span aria-hidden='true' className='block'>
                {lines.map((line, lIdx) => {
                    const words = line.split(' ')
                    return (
                        <span key={lIdx} className='block'>
                            {words.map((word, wIdx) => {
                                const wordDelay = delay + wordIndex * stagger
                                wordIndex++
                                const isNotLast = wIdx < words.length - 1
                                return (
                                    <span
                                        key={`${word}-${wIdx}`}
                                        className={cn(
                                            '-mt-[0.08em] -mb-[0.16em] inline-block overflow-hidden pt-[0.08em] pb-[0.16em] align-top',
                                            isNotLast && 'mr-[0.14em]'
                                        )}
                                    >
                                        <span
                                            style={{ transitionDelay: `${wordDelay}ms` }}
                                            className={cn('split-word inline-block', active && 'is-visible')}
                                        >
                                            {word}
                                        </span>
                                    </span>
                                )
                            })}
                        </span>
                    )
                })}
            </span>
        </Component>
    )
}
