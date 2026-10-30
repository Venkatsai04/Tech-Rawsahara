import type { FC, ReactNode } from 'react'
import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { useInView } from '@/hooks/use-in-view'

interface RevealProps {
    children: ReactNode
    className?: string
    delay?: number
}

export const Reveal: FC<RevealProps> = ({ children, className, delay = 0 }): ReactNode => {
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref)

    return (
        <div
            ref={ref}
            style={delay ? { transitionDelay: `${delay}ms` } : undefined}
            className={cn('reveal', inView && 'is-visible', className)}
        >
            {children}
        </div>
    )
}
