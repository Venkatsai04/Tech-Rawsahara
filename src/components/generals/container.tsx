import type { FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps {
    children: ReactNode
    className?: string
}

export const Container: FC<ContainerProps> = ({ children, className }): ReactNode => {
    return (
        <div className={cn('mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12', className)}>
            {children}
        </div>
    )
}
