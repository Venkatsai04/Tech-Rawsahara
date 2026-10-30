import type { FC, ReactNode } from 'react'

import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { useInView } from '@/hooks/use-in-view'
import { PROCESS_STEPS } from '@/constants/content'
import { Container } from '@/components/generals/container'
import { Reveal } from '@/components/generals/reveal'
import { RevealText } from '@/components/generals/reveal-text'
import { SectionLabel } from './section-label'
import { SilkDrift } from '@/components/dots/silk-drift'

export const ProcessSection: FC = (): ReactNode => {
    const listRef = useRef<HTMLOListElement>(null)
    const inView = useInView(listRef, { rootMargin: '0px 0px -20% 0px' })

    return (
        <section id='process' className='relative isolate border-t border-line bg-white'>
            <SilkDrift />

            <Container className='py-24 md:py-36'>
                <div className='grid gap-10 lg:grid-cols-12 lg:items-end'>
                    <div className='lg:col-span-8'>
                        <SectionLabel index='04'>Process</SectionLabel>
                        <RevealText
                            lines={['A simple process.', 'Systems built to work.']}
                            className='mt-8 text-[clamp(2.5rem,5.4vw,5rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-ink'
                        />
                    </div>

                    <Reveal className='lg:col-span-4'>
                        <p className='text-lg leading-relaxed text-ink/70'>
                            From understanding the problem to building and improving the solution, we keep the
                            process clear and collaborative.
                        </p>
                    </Reveal>
                </div>

                <ol
                    ref={listRef}
                    className='mt-16 grid gap-14 md:mt-24 md:grid-cols-2 md:gap-x-10 lg:grid-cols-4 lg:gap-0'
                >
                    {PROCESS_STEPS.map((step, idx) => {
                        const lineDelay = `${350 * idx}ms`
                        const dotDelay = `${350 * idx + 200}ms`

                        return (
                            <li key={step.number} className='relative pt-10 lg:pr-10'>
                                {/* Static Hairline */}
                                <span aria-hidden='true' className='absolute inset-x-0 top-0 h-px bg-line' />

                                {/* Animated Purple Connecting Line */}
                                <span
                                    aria-hidden='true'
                                    style={{ transitionDelay: lineDelay }}
                                    className={cn(
                                        'absolute inset-x-0 top-0 h-px origin-left bg-azure-500 transition-transform duration-700 ease-out',
                                        inView ? 'scale-x-100' : 'scale-x-0'
                                    )}
                                />

                                {/* Purple Node Point */}
                                <span
                                    aria-hidden='true'
                                    style={{ transitionDelay: dotDelay }}
                                    className={cn(
                                        'absolute -top-1 left-0 size-2 bg-azure-500 transition-opacity duration-300',
                                        inView ? 'opacity-100' : 'opacity-0'
                                    )}
                                />

                                <div className='flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em]'>
                                    <span className='text-azure-600'>{step.number}</span>
                                    <span className='text-muted-foreground'>{step.focus}</span>
                                </div>

                                <h3 className='mt-6 text-2xl font-semibold tracking-[-0.035em] text-ink md:text-[28px]'>
                                    {step.title}
                                </h3>
                                <p className='mt-3 text-[15px] leading-relaxed text-muted-foreground'>
                                    {step.description}
                                </p>
                            </li>
                        )
                    })}
                </ol>
            </Container>
        </section>
    )
}
