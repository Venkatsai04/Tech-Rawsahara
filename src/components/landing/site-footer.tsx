import type { FC, ReactNode } from 'react'

import Link from 'next/link'
import { ArrowUpRight, Mail } from 'lucide-react'
import { NAV_LINKS } from '@/constants/content'
import { Container } from '@/components/generals/container'
import { LogoLockup } from '@/components/generals/logo'
import { PixelGame } from '@/components/dots/pixel-game'

export const SiteFooter: FC = (): ReactNode => {
    return (
        <footer className='relative isolate border-t border-line bg-white'>
            <Container className='pt-20 pb-16 md:pt-28 md:pb-24'>
                <div className='grid gap-12 lg:grid-cols-12 lg:gap-8'>
                    <div className='lg:col-span-5'>
                        <Link href='/#top' aria-label='SAHARA LABS, back to top'>
                            <LogoLockup className='h-14 md:h-16' />
                        </Link>
                        <p className='mt-8 max-w-sm text-[15px] leading-relaxed text-muted-foreground'>
                            Lead generation, AI automation and voice systems that help businesses generate more
                            opportunities and reduce manual work.
                        </p>
                    </div>

                    <div className='lg:col-span-3 lg:col-start-7'>
                        <p className='font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground'>
                            Navigation
                        </p>
                        <ul className='mt-5 flex flex-col gap-3'>
                            {NAV_LINKS.map(link => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className='text-[15px] text-ink transition-colors hover:text-azure-600'
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className='lg:col-span-3'>
                        <p className='font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground'>
                            Get in touch
                        </p>
                        <p className='mt-5 text-[15px] leading-relaxed text-ink/75'>
                            Have a process you want to automate or a pipeline to fill?
                        </p>
                        <div className='mt-4 flex flex-col gap-2.5'>
                            <a
                                href='mailto:support@rawsahara.in'
                                className='inline-flex items-center gap-2 font-mono text-[13px] text-muted-foreground transition-colors hover:text-azure-600'
                            >
                                <Mail className='size-3.5 text-azure-600' />
                                <span>support@rawsahara.in</span>
                            </a>
                            <Link
                                href='/contact'
                                className='group inline-flex items-center gap-1.5 text-[15px] font-semibold text-ink transition-colors hover:text-azure-600'
                            >
                                Start a conversation
                                <ArrowUpRight
                                    aria-hidden='true'
                                    className='size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5'
                                />
                            </Link>
                        </div>
                    </div>
                </div>

            </Container>

            {/* Giant Sahara Labs Micro-Pixel Interactive Game Footer - Full Viewport Width */}
            <div className='w-full border-t border-line bg-white'>
                <div className='relative h-[550px] sm:h-[650px] md:h-[750px] lg:h-[840px] w-full overflow-hidden'>
                    <PixelGame />
                </div>
            </div>

            <Container>
                <div className='flex flex-col gap-3 border-t border-line py-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:flex-row md:items-center md:justify-between'>
                    <p>© 2026 SAHARA LABS</p>
                    <p>Lead generation × Automation × AI voice</p>
                    <Link href='/#top' className='inline-flex items-center gap-2 transition-colors hover:text-ink'>
                        Back to top ↑
                    </Link>
                </div>
            </Container>
        </footer>
    )
}
