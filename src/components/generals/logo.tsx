import type { FC, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
    className?: string
}

export const LogoMark: FC<LogoProps> = ({ className }): ReactNode => (
    <svg
        viewBox='155.93 57.60 181.08 360.00'
        aria-hidden='true'
        className={cn('block w-auto mix-blend-multiply', className)}
    >
        <image href='/images/sahara-labs-logo.png' width='503' height='576' preserveAspectRatio='none' />
    </svg>
)

export const LogoLockup: FC<LogoProps> = ({ className }): ReactNode => (
    <svg
        viewBox='155.93 57.60 181.08 430.00'
        aria-hidden='true'
        className={cn('block w-auto mix-blend-multiply', className)}
    >
        <image href='/images/sahara-labs-logo.png' width='503' height='576' preserveAspectRatio='none' />
    </svg>
)

export const Logo: FC<LogoProps> = ({ className }): ReactNode => (
    <span className={cn('inline-flex items-center gap-2.5 text-ink', className)}>
        <LogoMark className='h-9' />
        <span className='text-[15px] font-bold leading-none'>Sahara Labs</span>
    </span>
)
