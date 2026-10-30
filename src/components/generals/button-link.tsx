import type { FC, ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ButtonLinkProps {
    href: string
    children: ReactNode
    variant?: 'primary' | 'secondary'
    size?: 'sm' | 'md'
    className?: string
    onClick?: () => void
}

export const ButtonLink: FC<ButtonLinkProps> = ({
    href,
    children,
    variant = 'primary',
    size = 'md',
    className,
    onClick
}): ReactNode => {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                'group inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.01em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure-500',
                size === 'md' ? 'h-12 px-6 text-[15px]' : 'h-10 px-5 text-sm',
                variant === 'primary'
                    ? 'bg-ink text-white hover:bg-azure-600'
                    : 'border border-ink/15 bg-white/80 text-ink backdrop-blur-sm hover:border-ink',
                className
            )}
        >
            {children}
        </Link>
    )
}
