import type { GetStaticPaths, GetStaticProps } from 'next'
import type { ReactNode } from 'react'

import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react'
import { PROJECTS, type Project } from '@/constants/content'
import { Seo } from '@/components/generals/seo'
import { Container } from '@/components/generals/container'
import { Reveal } from '@/components/generals/reveal'
import { RevealText } from '@/components/generals/reveal-text'
import { SectionLabel } from '@/components/landing/section-label'
import { HalftoneImage } from '@/components/dots/halftone-image'
import { SilkDrift } from '@/components/dots/silk-drift'
import { ButtonLink } from '@/components/generals/button-link'

interface ProjectPageProps {
    project: Project
}

export default function ProjectPage({ project }: ProjectPageProps): ReactNode {
    if (!project) return null

    return (
        <>
            <Seo title={project.title} description={project.summary} />

            <article className='relative isolate min-h-screen bg-white'>
                <SilkDrift />

                {/* Project Header */}
                <header className='pt-28 pb-12 md:pt-36 md:pb-16'>
                    <Container>
                        <div className='flex items-center gap-4'>
                            <Link
                                href='/#work'
                                className='group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-ink'
                            >
                                <ArrowLeft className='size-3.5 transition-transform duration-300 group-hover:-translate-x-1' />
                                Back to selected work
                            </Link>
                        </div>

                        <div className='mt-8 flex flex-wrap items-center gap-3'>
                            <span className='font-mono text-[11px] uppercase tracking-[0.14em] text-azure-600'>
                                {project.number} / {project.category}
                            </span>
                            {project.tags.map(tag => (
                                <span
                                    key={tag}
                                    className='rounded-full border border-ink/10 px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground'
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <RevealText
                            as='h1'
                            lines={[project.title]}
                            className='mt-6 text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-ink'
                        />

                        <p className='mt-6 max-w-2xl text-lg leading-relaxed text-ink/70'>
                            {project.summary}
                        </p>
                    </Container>
                </header>

                {/* Hero Halftone Media */}
                <div className='border-y border-line bg-mist'>
                    <Container className='py-8 sm:py-12'>
                        <div className='relative aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden border border-line bg-white shadow-sm'>
                            <HalftoneImage
                                src={project.image}
                                alt={project.imageAlt}
                                focusX={project.focusX}
                                focusY={project.focusY}
                                sizes='100vw'
                                className='size-full'
                            />
                        </div>
                    </Container>
                </div>

                {/* Case Study Details */}
                <div className='py-20 md:py-32'>
                    <Container>
                        <div className='grid gap-16 lg:grid-cols-12'>
                            {/* Problem & Approach */}
                            <div className='lg:col-span-8 flex flex-col gap-16'>
                                <section>
                                    <SectionLabel index='01'>The Challenge</SectionLabel>
                                    <Reveal className='mt-6'>
                                        <p className='text-xl leading-relaxed text-ink/80 md:text-2xl'>
                                            {project.challenge}
                                        </p>
                                    </Reveal>
                                </section>

                                <section>
                                    <SectionLabel index='02'>The Approach</SectionLabel>
                                    <Reveal className='mt-6'>
                                        <p className='text-xl leading-relaxed text-ink/80 md:text-2xl'>
                                            {project.approach}
                                        </p>
                                    </Reveal>
                                </section>

                                {/* 4-Step Flow */}
                                <section className='pt-8'>
                                    <p className='font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground'>
                                        How the workflow operates
                                    </p>
                                    <ol className='mt-8 grid border-t border-l border-line sm:grid-cols-2'>
                                        {project.steps.map((step, idx) => (
                                            <li
                                                key={step.title}
                                                className='border-r border-b border-line bg-white p-6 md:p-8'
                                            >
                                                <span className='font-mono text-[11px] tracking-[0.14em] text-azure-600'>
                                                    0{idx + 1}
                                                </span>
                                                <h4 className='mt-4 text-xl font-semibold text-ink'>
                                                    {step.title}
                                                </h4>
                                                <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
                                                    {step.text}
                                                </p>
                                            </li>
                                        ))}
                                    </ol>
                                </section>
                            </div>

                            {/* Sidebar Deliverables & CTA */}
                            <div className='lg:col-span-4 flex flex-col gap-12'>
                                <div className='border border-line bg-mist p-8'>
                                    <p className='font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground'>
                                        What was delivered
                                    </p>
                                    <ul className='mt-6 flex flex-col gap-3'>
                                        {project.includes.map(inc => (
                                            <li key={inc} className='flex items-start gap-2.5 text-sm text-ink/80'>
                                                <Check className='mt-0.5 size-4 shrink-0 text-azure-500' />
                                                {inc}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className='border border-line bg-white p-8'>
                                    <p className='font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground'>
                                        Interested in this system?
                                    </p>
                                    <h4 className='mt-4 text-xl font-semibold text-ink'>
                                        Discuss a similar solution for your business.
                                    </h4>
                                    <div className='mt-6'>
                                        <ButtonLink href='/contact' className='w-full'>
                                            Start a Conversation
                                            <ArrowUpRight className='size-4' />
                                        </ButtonLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Container>
                </div>
            </article>
        </>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: PROJECTS.map(p => ({ params: { slug: p.slug } })),
        fallback: false
    }
}

export const getStaticProps: GetStaticProps<ProjectPageProps> = async ({ params }) => {
    const slug = params?.slug as string
    const project = PROJECTS.find(p => p.slug === slug)

    if (!project) {
        return { notFound: true }
    }

    return {
        props: {
            project
        }
    }
}
