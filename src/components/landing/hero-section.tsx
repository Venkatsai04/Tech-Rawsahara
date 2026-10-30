import type { FC, ReactNode } from 'react'

import { useMemo } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/generals/container'
import { ButtonLink } from '@/components/generals/button-link'
import { RevealText } from '@/components/generals/reveal-text'
import { DotCanvas } from '@/components/dots/dot-canvas'
import { createSilkField } from '@/lib/dots/fields'

export const HeroSection: FC = (): ReactNode => {
    const silkField = useMemo(() => createSilkField(3, 0), [])

    return (
        <section id='top' className='relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-white'>
            {/* Background Canvas & Fade Gradient */}
            <div aria-hidden='true' className='absolute inset-0 -z-10'>
                <DotCanvas field={silkField} cell={7} mobileCell={5} interactive={true} maxCells={26000} speed={1} />
                <div className='pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-linear-to-t from-white via-white/85 to-transparent' />
            </div>

            <Container className='flex flex-1 flex-col pt-24 pb-10 md:pt-32 md:pb-14'>
                <div className='flex items-start justify-between gap-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground motion-safe:animate-in fade-in duration-1000 fill-mode-both delay-500'>
                    <p className='flex items-center gap-2.5 text-ink'>
                        <span aria-hidden='true' className='size-1.5 shrink-0 bg-azure-500' />
                        Lead generation × Automation
                    </p>
                    <a
                        href='#outcomes'
                        className='group hidden items-center gap-2 transition-colors hover:text-ink sm:inline-flex'
                    >
                        Scroll to explore
                        <ArrowDown
                            aria-hidden='true'
                            className='size-3.5 transition-transform duration-300 group-hover:translate-y-0.5'
                        />
                    </a>
                </div>

                <div className='mt-auto pt-20'>
                    <RevealText
                        as='h1'
                        immediate={true}
                        lines={['More Opportunities.', 'Less Manual Work.']}
                        className='text-[clamp(2.6rem,8.6vw,9.5rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-ink'
                        delay={200}
                        stagger={90}
                    />

                    <div className='mt-10 grid gap-8 border-t border-ink/10 pt-8 motion-safe:animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both delay-700 md:mt-14 lg:grid-cols-12 lg:items-end lg:gap-10'>
                        <p className='max-w-xl text-[17px] leading-relaxed text-ink/75 lg:col-span-6'>
                            We build lead generation systems, AI automations and AI voice agents that help
                            businesses generate more opportunities, convert more leads and reduce repetitive
                            work.
                        </p>

                        <div className='flex flex-wrap gap-3 lg:col-span-6 lg:justify-end'>
                            <ButtonLink href='#contact'>
                                Book a Call
                                <ArrowUpRight
                                    aria-hidden='true'
                                    className='size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5'
                                />
                            </ButtonLink>
                            <ButtonLink href='#work' variant='secondary'>
                                Explore Our Work
                            </ButtonLink>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    )
}
