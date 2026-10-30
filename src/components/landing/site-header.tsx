import type { FC, ReactNode } from 'react'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/constants/site'
import { NAV_LINKS } from '@/constants/content'
import { Container } from '@/components/generals/container'
import { Logo } from '@/components/generals/logo'
import { ButtonLink } from '@/components/generals/button-link'

export const SiteHeader: FC = (): ReactNode => {
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    useEffect(() => {
        const onScroll = (): void => setScrolled(window.scrollY > 24)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        if (!mobileOpen) return

        const onKeyDown = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') setMobileOpen(false)
        }
        const onResize = (): void => {
            if (window.innerWidth >= 1024) setMobileOpen(false)
        }

        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('resize', onResize)

        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('resize', onResize)
        }
    }, [mobileOpen])

    const closeMobile = (): void => setMobileOpen(false)

    return (
        <header
            className={cn(
                'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300',
                mobileOpen
                    ? 'border-line bg-white'
                    : scrolled
                      ? 'border-line bg-white/85 backdrop-blur-md'
                      : 'border-transparent bg-transparent'
            )}
        >
            <Container className='flex h-16 items-center justify-between gap-6 md:h-[72px]'>
                <Link
                    href='/#top'
                    onClick={closeMobile}
                    aria-label={`${siteConfig.name}, back to the top of the homepage`}
                    className='rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-azure-500'
                >
                    <Logo />
                </Link>

                <nav aria-label='Main' className='hidden lg:block'>
                    <ul className='flex items-center gap-8 xl:gap-10'>
                        {NAV_LINKS.map(link => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className='group relative py-2 font-mono text-[12px] uppercase tracking-[0.12em] text-ink/65 transition-colors hover:text-ink focus-visible:text-ink focus-visible:outline-none'
                                >
                                    {link.label}
                                    <span
                                        aria-hidden='true'
                                        className='absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-azure-500 transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100'
                                    />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className='flex items-center gap-3'>
                    <ButtonLink href='/contact' size='sm' className='hidden sm:inline-flex'>
                        Let’s Talk
                        <ArrowUpRight
                            aria-hidden='true'
                            className='size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5'
                        />
                    </ButtonLink>

                    <button
                        type='button'
                        aria-expanded={mobileOpen}
                        aria-controls='mobile-menu'
                        onClick={() => setMobileOpen(prev => !prev)}
                        className='inline-flex size-11 items-center justify-center rounded-full border border-ink/15 bg-white/80 text-ink backdrop-blur-sm transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure-500 lg:hidden'
                    >
                        {mobileOpen ? (
                            <X aria-hidden='true' className='size-5' />
                        ) : (
                            <Menu aria-hidden='true' className='size-5' />
                        )}
                        <span className='sr-only'>{mobileOpen ? 'Close menu' : 'Open menu'}</span>
                    </button>
                </div>
            </Container>

            <div
                id='mobile-menu'
                hidden={!mobileOpen}
                className={cn(
                    'fixed inset-x-0 top-16 bottom-0 overflow-y-auto border-t border-line bg-white md:top-[72px] lg:hidden',
                    !mobileOpen && 'hidden'
                )}
            >
                <Container className='flex min-h-full flex-col justify-between gap-12 py-10'>
                    <nav aria-label='Mobile'>
                        <ul className='flex flex-col'>
                            {NAV_LINKS.map((link, idx) => (
                                <li key={link.href} className='border-b border-line'>
                                    <Link
                                        href={link.href}
                                        onClick={closeMobile}
                                        className='flex items-baseline justify-between py-5 text-4xl font-semibold tracking-[-0.04em] text-ink transition-colors hover:text-azure-600'
                                    >
                                        {link.label}
                                        <span className='font-mono text-[11px] font-normal tracking-[0.14em] text-muted-foreground'>
                                            0{idx + 1}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className='flex flex-col gap-6'>
                        <ButtonLink href='/contact' onClick={closeMobile} className='w-full'>
                            Let’s Talk
                            <ArrowUpRight aria-hidden='true' className='size-4' />
                        </ButtonLink>
                        <p className='font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground'>
                            {siteConfig.tagline}
                        </p>
                    </div>
                </Container>
            </div>
        </header>
    )
}
