import type { FC, ReactNode } from 'react'

import { OUTCOMES, CAPABILITIES } from '@/constants/content'
import { Container } from '@/components/generals/container'
import { Reveal } from '@/components/generals/reveal'
import { RevealText } from '@/components/generals/reveal-text'

export const OutcomesSection: FC = (): ReactNode => {
    const marqueeItems = [...CAPABILITIES, ...CAPABILITIES]

    return (
        <section id='outcomes' aria-label='Business outcomes' className='relative isolate border-t border-line bg-white'>
            <Container className='py-24 md:py-32'>
                <div className='grid gap-10 lg:grid-cols-12 lg:items-end'>
                    <div className='lg:col-span-7'>
                        <p className='flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink'>
                            <span aria-hidden='true' className='size-1.5 bg-azure-500' />
                            What we focus on
                        </p>
                        <RevealText
                            lines={['Built around', 'business outcomes.']}
                            className='mt-8 text-[clamp(2.5rem,5.4vw,5rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-ink'
                        />
                    </div>

                    <Reveal className='lg:col-span-4 lg:col-start-9'>
                        <p className='text-lg leading-relaxed text-ink/70'>
                            We work with businesses to identify operational gaps, improve lead management and build
                            systems that make everyday processes more efficient.
                        </p>
                    </Reveal>
                </div>

                <ul className='mt-16 grid border-t border-l border-line md:mt-20 md:grid-cols-3'>
                    {OUTCOMES.map((outcome, idx) => (
                        <li
                            key={outcome.number}
                            className='group border-r border-b border-line bg-white transition-colors duration-500 hover:bg-mist'
                        >
                            <Reveal delay={110 * idx} className='flex h-full flex-col p-7 md:p-9'>
                                <div className='flex items-center justify-between'>
                                    <span className='font-mono text-[11px] tracking-[0.14em] text-azure-600'>
                                        {outcome.number}
                                    </span>
                                    <span aria-hidden='true' className='grid grid-cols-3 gap-[3px]'>
                                        {Array.from({ length: 9 }, (_, dotIdx) => (
                                            <span
                                                key={dotIdx}
                                                style={{ transitionDelay: `${40 * dotIdx}ms` }}
                                                className='size-[5px] bg-azure-200 transition-colors duration-500 group-hover:bg-azure-500'
                                            />
                                        ))}
                                    </span>
                                </div>

                                <h3 className='mt-14 text-2xl font-semibold tracking-[-0.035em] text-ink md:text-[28px]'>
                                    {outcome.title}
                                </h3>
                                <p className='mt-3 max-w-sm text-[15px] leading-relaxed text-muted-foreground'>
                                    {outcome.description}
                                </p>
                            </Reveal>
                        </li>
                    ))}
                </ul>
            </Container>

            {/* Marquee Banner */}
            <div className='border-t border-line bg-mist'>
                <Container className='flex flex-col gap-5 py-7 md:flex-row md:items-center md:gap-10'>
                    <p className='shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:w-44'>
                        What we connect
                    </p>
                    <div className='marquee min-w-0 flex-1 overflow-hidden'>
                        <ul className='marquee-track flex w-max items-center'>
                            {marqueeItems.map((item, idx) => {
                                const Icon = item.icon
                                const isDuplicate = idx >= CAPABILITIES.length
                                return (
                                    <li
                                        key={idx}
                                        aria-hidden={isDuplicate}
                                        className='flex shrink-0 items-center gap-2.5 pr-12 text-ink/55 transition-colors duration-300 hover:text-ink'
                                    >
                                        <Icon aria-hidden='true' className='size-5 text-azure-500' />
                                        <span className='whitespace-nowrap text-lg font-medium tracking-[-0.02em]'>
                                            {item.label}
                                        </span>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </Container>
            </div>
        </section>
    )
}
