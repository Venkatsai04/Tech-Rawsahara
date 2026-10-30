import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { Seo } from '@/components/generals/seo'
import { Container } from '@/components/generals/container'
import { SectionLabel } from '@/components/landing/section-label'
import { Reveal } from '@/components/generals/reveal'
import { RevealText } from '@/components/generals/reveal-text'
import { ContactSection } from '@/components/landing/contact-section'
import { DotCanvas } from '@/components/dots/dot-canvas'
import { SilkDrift } from '@/components/dots/silk-drift'
import { createSilkField } from '@/lib/dots/fields'

const NEXT_STEPS = [
    {
        number: '01',
        title: 'We review your enquiry',
        description:
            'We look at your existing processes, integrations and goals to see where automation makes the most sense.'
    },
    {
        number: '02',
        title: 'A discovery call',
        description:
            'A 30-minute conversation to walk through your current workflow and agree on the scope.'
    },
    {
        number: '03',
        title: 'A clear proposal',
        description:
            'We deliver a straightforward proposal outlining the solution, integrations, timeline and fixed price.'
    }
]

export default function ContactPage(): ReactNode {
    const silkField = useMemo(() => createSilkField(12, 0.1), [])

    return (
        <>
            <Seo title='Contact' />

            {/* Hero Top */}
            <section id='top' className='relative isolate flex min-h-[72svh] items-end overflow-hidden bg-white'>
                <div aria-hidden='true' className='absolute inset-0 -z-10'>
                    <DotCanvas field={silkField} cell={7} mobileCell={5} interactive={true} maxCells={24000} speed={1} />
                    <div className='pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-white via-white/80 to-transparent' />
                </div>

                <Container className='pt-32 pb-16 md:pb-24'>
                    <p className='flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink motion-safe:animate-in fade-in duration-1000 fill-mode-both delay-300'>
                        <span aria-hidden='true' className='size-1.5 bg-azure-500' />
                        Get in touch
                    </p>

                    <RevealText
                        as='h1'
                        immediate={true}
                        lines={['Start a', 'conversation.']}
                        className='mt-8 text-[clamp(3rem,8vw,7rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-ink'
                        delay={150}
                        stagger={80}
                    />

                    <p className='mt-8 max-w-xl text-lg leading-relaxed text-ink/75'>
                        Tell us about what you want to automate or build, and we’ll figure out how we can help.
                    </p>
                </Container>
            </section>

            {/* What Happens Next Steps */}
            <section id='next-steps' className='relative isolate border-t border-line bg-white'>
                <SilkDrift />

                <Container className='py-24 md:py-32'>
                    <SectionLabel index='01'>What happens next</SectionLabel>

                    <ol className='mt-12 grid border-t border-l border-line md:grid-cols-3'>
                        {NEXT_STEPS.map((step, idx) => (
                            <li key={step.number} className='border-r border-b border-line bg-white p-8 md:p-10'>
                                <Reveal delay={120 * idx}>
                                    <span className='font-mono text-[11px] uppercase tracking-[0.14em] text-azure-600'>
                                        {step.number}
                                    </span>
                                    <h3 className='mt-8 text-2xl font-semibold tracking-[-0.035em] text-ink'>
                                        {step.title}
                                    </h3>
                                    <p className='mt-4 text-[15px] leading-relaxed text-muted-foreground'>
                                        {step.description}
                                    </p>
                                </Reveal>
                            </li>
                        ))}
                    </ol>
                </Container>
            </section>

            {/* Overridden Contact Section */}
            <ContactSection
                index='02'
                label='Write to us'
                lines={['Tell us about', 'your project.']}
            />
        </>
    )
}
