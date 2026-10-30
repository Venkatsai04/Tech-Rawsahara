import type { FC, ReactNode } from 'react'

import { useMemo } from 'react'
import { PIPELINE_STAGES } from '@/constants/content'
import { siteConfig } from '@/constants/site'
import { Container } from '@/components/generals/container'
import { Reveal } from '@/components/generals/reveal'
import { RevealText } from '@/components/generals/reveal-text'
import { SectionLabel } from './section-label'
import { DotCanvas } from '@/components/dots/dot-canvas'
import { SilkDrift } from '@/components/dots/silk-drift'
import { createPipelineField } from '@/lib/dots/fields'

const LABEL_STYLE =
    'absolute top-4 z-10 bg-white/90 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:top-5 sm:text-[11px]'

export const StudioSection: FC = (): ReactNode => {
    const pipelineField = useMemo(
        () => createPipelineField(PIPELINE_STAGES.map(s => s.stop)),
        []
    )

    return (
        <section id='studio' className='relative isolate border-t border-line bg-white'>
            <SilkDrift />

            <Container className='py-24 md:py-36'>
                <div className='grid gap-10 lg:grid-cols-12'>
                    <div className='lg:col-span-3'>
                        <SectionLabel index='01'>The studio</SectionLabel>
                    </div>

                    <div className='lg:col-span-9'>
                        <RevealText
                            lines={['We build systems that', 'move businesses forward.']}
                            className='text-[clamp(2.5rem,5.4vw,5rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-ink'
                        />

                        <div className='mt-12 grid gap-8 md:mt-16 md:grid-cols-2 md:gap-10'>
                            <Reveal>
                                <p className='text-xl leading-relaxed tracking-[-0.01em] text-ink'>
                                    {siteConfig.name} helps businesses connect lead generation, customer conversations
                                    and internal workflows through practical automation and AI.
                                </p>
                            </Reveal>

                            <Reveal delay={120}>
                                <p className='text-lg leading-relaxed text-ink/65'>
                                    From capturing a new enquiry to qualifying a prospect, following up and booking a
                                    conversation, we build systems that reduce manual effort and help businesses respond
                                    more effectively.
                                </p>
                            </Reveal>
                        </div>
                    </div>
                </div>

                {/* Pipeline Diagram */}
                <Reveal className='mt-20 md:mt-28'>
                    <figure>
                        <div className='border border-line bg-white'>
                            <div className='relative aspect-[2/1] sm:aspect-[3/1] lg:aspect-[7/2]'>
                                <DotCanvas
                                    field={pipelineField}
                                    grid={true}
                                    interactive={true}
                                    cell={7}
                                    mobileCell={5}
                                    startTime={1}
                                />
                                <span className={`${LABEL_STYLE} left-4 sm:left-5`}>Enquiries in</span>
                                <span className={`${LABEL_STYLE} right-4 sm:right-5`}>Conversations booked</span>
                            </div>

                            <ol className='relative h-20 border-t border-line'>
                                {PIPELINE_STAGES.map((stage, idx) => (
                                    <li
                                        key={stage.label}
                                        style={{ left: `${100 * stage.stop}%` }}
                                        className='absolute top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-center'
                                    >
                                        <span className='block font-mono text-[10px] tracking-[0.14em] text-azure-600'>
                                            0{idx + 1}
                                        </span>
                                        <span className='mt-1 block text-sm font-semibold tracking-[-0.02em] text-ink sm:text-lg'>
                                            {stage.label}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <figcaption className='mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground'>
                            One connected system, from the first enquiry to a booked conversation.
                        </figcaption>
                    </figure>
                </Reveal>
            </Container>
        </section>
    )
}
