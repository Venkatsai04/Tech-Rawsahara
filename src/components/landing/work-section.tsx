import type { FC, ReactNode } from 'react'

import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { PROJECTS, type Project } from '@/constants/content'
import { Container } from '@/components/generals/container'
import { Reveal } from '@/components/generals/reveal'
import { RevealText } from '@/components/generals/reveal-text'
import { SectionLabel } from './section-label'
import { HalftoneImage } from '@/components/dots/halftone-image'
import { SilkDrift } from '@/components/dots/silk-drift'

interface ProjectCardProps {
    project: Project
    index: number
}

const ProjectCard: FC<ProjectCardProps> = ({ project, index }): ReactNode => {
    return (
        <article className='group flex h-full flex-col'>
            <Reveal
                delay={(index % 2) * 130}
                className='flex h-full flex-col transition-transform duration-500 ease-out group-hover:-translate-y-1'
            >
                {/* Uniform Image Frame for all cards */}
                <Link
                    href={`/work/${project.slug}`}
                    className='relative block aspect-[16/10] w-full overflow-hidden border border-line bg-white shadow-xs transition-colors duration-300 group-hover:border-ink/30'
                >
                    <HalftoneImage
                        src={project.image}
                        alt={project.imageAlt}
                        focusX={project.focusX}
                        focusY={project.focusY}
                        sizes='(min-width: 1024px) 50vw, 100vw'
                        className='aspect-[16/10] w-full'
                    />
                    <div className='absolute top-5 left-5 z-10 bg-white/90 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink backdrop-blur-xs'>
                        {project.number} / {project.category}
                    </div>
                </Link>

                {/* Card Content */}
                <div className='mt-6 flex flex-1 flex-col'>
                    <div className='flex flex-wrap gap-2'>
                        {project.tags.map(tag => (
                            <span
                                key={tag}
                                className='rounded-full border border-ink/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground'
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    <h3 className='mt-4 text-2xl font-semibold tracking-[-0.035em] text-ink transition-colors duration-300 group-hover:text-azure-600 md:text-[28px]'>
                        <Link href={`/work/${project.slug}`} className='inline-flex items-center gap-2'>
                            {project.title}
                            <ArrowUpRight
                                aria-hidden='true'
                                className='size-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5'
                            />
                        </Link>
                    </h3>

                    <p className='mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground'>
                        {project.summary}
                    </p>
                </div>
            </Reveal>
        </article>
    )
}

export const WorkSection: FC = (): ReactNode => {
    return (
        <section id='work' className='relative isolate border-t border-line bg-white'>
            <SilkDrift />

            <Container className='py-24 md:py-36'>
                <div className='grid gap-10 lg:grid-cols-12 lg:items-end'>
                    <div className='lg:col-span-8'>
                        <SectionLabel index='03'>Selected work</SectionLabel>
                        <RevealText
                            lines={['Real business problems.', 'Practical systems.']}
                            className='mt-8 text-[clamp(2.5rem,5.4vw,5rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-ink'
                        />
                    </div>

                    <Reveal className='lg:col-span-4'>
                        <p className='text-lg leading-relaxed text-ink/70'>
                            Systems we have designed and built across five industries. Open a project to see the
                            problem, the workflow and what was delivered.
                        </p>
                        <div className='mt-6'>
                            <Link
                                href='/contact'
                                className='group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:text-azure-600'
                            >
                                Discuss a similar project
                                <ArrowRight
                                    aria-hidden='true'
                                    className='size-3.5 transition-transform duration-300 group-hover:translate-x-1'
                                />
                            </Link>
                        </div>
                    </Reveal>
                </div>

                {/* Uniform Same-Size Cards Grid with Smooth Scroll Animations */}
                <div className='mt-16 grid grid-cols-1 gap-10 md:mt-24 md:grid-cols-2 md:gap-x-10 md:gap-y-16 lg:gap-x-12 lg:gap-y-20'>
                    {PROJECTS.map((project, idx) => (
                        <ProjectCard key={project.slug} project={project} index={idx} />
                    ))}
                </div>
            </Container>
        </section>
    )
}
