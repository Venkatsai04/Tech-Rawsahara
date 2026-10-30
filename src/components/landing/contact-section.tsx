import type { FC, ReactNode } from 'react'

import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/generals/container'
import { Reveal } from '@/components/generals/reveal'
import { RevealText } from '@/components/generals/reveal-text'
import { SectionLabel } from './section-label'
import { ContactForm } from './contact-form'
import { SilkDrift } from '@/components/dots/silk-drift'

interface ContactSectionProps {
    index?: string
    label?: string
    lines?: string[]
}

const HELPFUL_TIPS = [
    'Your business and the team involved',
    'The challenge or process you want to improve',
    'The tools you already use, like your CRM'
]

export const ContactSection: FC<ContactSectionProps> = ({
    index = '05',
    label = 'Contact',
    lines = ["Let's build", "what's next."]
}): ReactNode => {
    const focusForm = (): void => {
        const input = document.getElementById('name')
        if (input) {
            input.focus()
            input.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }

    return (
        <section id='contact' className='relative isolate border-t border-line bg-white'>
            <SilkDrift />

            <Container className='py-24 md:py-36'>
                <div className='grid gap-16 lg:grid-cols-12 lg:gap-12'>
                    <div className='lg:col-span-5'>
                        <SectionLabel index={index}>{label}</SectionLabel>
                        <RevealText
                            lines={lines}
                            className='mt-8 text-[clamp(2.5rem,5.4vw,5rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-ink'
                        />

                        <Reveal className='mt-8'>
                            <p className='text-lg leading-relaxed text-ink/70'>
                                Tell us about your business, the challenges you’re facing and the processes you
                                want to improve. We’ll explore how the right systems can help.
                            </p>

                            <div className='mt-8'>
                                <button
                                    type='button'
                                    onClick={focusForm}
                                    className='group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-[15px] font-medium tracking-[-0.01em] text-white transition-colors hover:bg-azure-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure-500'
                                >
                                    Start a Conversation
                                    <ArrowUpRight
                                        aria-hidden='true'
                                        className='size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5'
                                    />
                                </button>
                            </div>

                            <div className='mt-16 border-t border-line pt-8'>
                                <p className='font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground'>
                                    Helpful to include
                                </p>
                                <ul className='mt-6 flex flex-col gap-4'>
                                    {HELPUL_TIPS.map((tip, idx) => (
                                        <li
                                            key={idx}
                                            className='flex items-baseline gap-4 border-b border-line pb-4 text-[15px] text-ink/80'
                                        >
                                            <span className='font-mono text-[11px] tracking-[0.14em] text-azure-600'>
                                                0{idx + 1}
                                            </span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Reveal>
                    </div>

                    <div className='lg:col-span-7 lg:col-start-6'>
                        <Reveal delay={120}>
                            <ContactForm />
                        </Reveal>
                    </div>
                </div>
            </Container>
        </section>
    )
}

const HELPUL_TIPS = [
    'Your business and the team involved',
    'The challenge or process you want to improve',
    'The tools you already use, like your CRM'
]
