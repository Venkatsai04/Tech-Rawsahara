import type { FC, ReactNode } from 'react'
import { SiteHeader } from '@/components/landing/site-header'
import { SiteFooter } from '@/components/landing/site-footer'
import { CursorDots } from '@/components/dots/cursor-dots'

interface LayoutProps {
    children: ReactNode
}

export const Layout: FC<LayoutProps> = ({ children }): ReactNode => {
    return (
        <div className='flex min-h-screen flex-col font-sans'>
            <a
                href='#main'
                className='sr-only z-[60] rounded-full bg-ink px-5 py-3 text-sm text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3'
            >
                Skip to content
            </a>

            <SiteHeader />

            <main id='main' className='flex-1'>
                {children}
            </main>

            <SiteFooter />

            <CursorDots />
        </div>
    )
}
