import type { FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionLabelProps {
    index?: string
    children: ReactNode
    className?: string
}

export const SectionLabel: FC<SectionLabelProps> = ({
    index,
    children,
    className
}): ReactNode => {
    return (
        <p
            className={cn(
                'flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground',
                className
            )}
        >
            <span aria-hidden='true' className='size-1.5 bg-azure-500' />
            {index && <span>({index})</span>}
            <span className='text-ink'>{children}</span>
        </p>
    )
}
