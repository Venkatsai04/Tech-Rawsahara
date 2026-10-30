import type { ReactNode } from 'react'
import { Seo } from '@/components/generals/seo'
import { HeroSection } from '@/components/landing/hero-section'
import { OutcomesSection } from '@/components/landing/outcomes-section'
import { StudioSection } from '@/components/landing/studio-section'
import { ServicesSection } from '@/components/landing/services-section'
import { WorkSection } from '@/components/landing/work-section'
import { ProcessSection } from '@/components/landing/process-section'
import { ContactSection } from '@/components/landing/contact-section'

export default function HomePage(): ReactNode {
    return (
        <>
            <Seo />
            <HeroSection />
            <OutcomesSection />
            <StudioSection />
            <ServicesSection />
            <WorkSection />
            <ProcessSection />
            <ContactSection />
        </>
    )
}
