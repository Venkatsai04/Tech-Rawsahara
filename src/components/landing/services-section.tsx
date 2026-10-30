import type { FC, ReactNode } from 'react'

import { Check } from 'lucide-react'
import { SERVICES } from '@/constants/content'
import { Container } from '@/components/generals/container'
import { Reveal } from '@/components/generals/reveal'
import { RevealText } from '@/components/generals/reveal-text'
import { SectionLabel } from './section-label'
import { ServiceMotif } from './service-motif'
import { SilkDrift } from '@/components/dots/silk-drift'

export const ServicesSection: FC = (): ReactNode => {
    return (
        <section id='services' className='relative isolate border-t border-line bg-white'>
            <SilkDrift />

            <Container className='py-24 md:py-36'>
                <div className='grid gap-10 lg:grid-cols-12 lg:items-end'>
                    <div className='lg:col-span-8'>
                        <SectionLabel index='02'>Services</SectionLabel>
                        <RevealText
                            lines={['Everything you need to', 'generate, qualify and convert.']}
                            className='mt-8 text-[clamp(2.5rem,5.4vw,5rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-ink'
                        />
                    </div>

                    <Reveal className='lg:col-span-4'>
                        <p className='text-lg leading-relaxed text-ink/70'>
                            Four connected services that work on their own or together, from the first touchpoint
                            with a prospect to the last reply to a customer.
                        </p>
                    </Reveal>
                </div>

                <ul className='mt-16 grid border-t border-l border-line md:mt-24 md:grid-cols-2'>
                    {SERVICES.map((service, idx) => (
                        <li
                            key={service.number}
                            className='flex flex-col border-r border-b border-line bg-white transition-colors duration-500 hover:bg-mist'
                        >
                            <Reveal delay={(idx % 2) * 110} className='flex h-full flex-col'>
                                <div className='relative h-52 border-b border-line md:h-60'>
                                    <ServiceMotif motif={service.motif} />
                                    <span className='absolute top-5 left-5 bg-white px-2 py-1 font-mono text-[11px] tracking-[0.14em] text-ink'>
                                        {service.number}
                                    </span>
                                </div>

                                <div className='flex flex-1 flex-col p-6 md:p-9'>
                                    <h3 className='text-2xl font-semibold tracking-[-0.035em] text-ink md:text-[32px]'>
                                        {service.title}
                                    </h3>
                                    <p className='mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground md:text-base'>
                                        {service.description}
                                    </p>

                                    <ul className='mt-auto grid gap-x-6 gap-y-3 pt-10 sm:grid-cols-2'>
                                        {service.capabilities.map(cap => (
                                            <li key={cap} className='flex items-start gap-2.5 text-[15px] text-ink/80'>
                                                <Check
                                                    aria-hidden='true'
                                                    className='mt-0.5 size-4 shrink-0 text-azure-500'
                                                />
                                                {cap}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Reveal>
                        </li>
                    ))}
                </ul>
            </Container>
        </section>
    )
}
