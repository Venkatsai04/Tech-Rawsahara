import type { ReactNode } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { siteConfig } from '@/constants/site'
import { Container } from '@/components/generals/container'
import { ButtonLink } from '@/components/generals/button-link'
import { SilkDrift } from '@/components/dots/silk-drift'

export default function NotFound(): ReactNode {
    return (
        <>
            <Head>
                <title>404 - {siteConfig.name}</title>
            </Head>

            <div className='relative isolate flex min-h-[80svh] items-center bg-white'>
                <SilkDrift />

                <Container className='py-32 text-center'>
                    <p className='font-mono text-sm tracking-[0.2em] text-azure-600 uppercase'>404 Error</p>
                    <h1 className='mt-4 text-4xl font-semibold tracking-[-0.04em] text-ink md:text-6xl'>
                        Page not found
                    </h1>
                    <p className='mx-auto mt-4 max-w-md text-base text-muted-foreground'>
                        The page you are looking for does not exist or has been moved.
                    </p>
                    <div className='mt-8 flex justify-center'>
                        <ButtonLink href='/'>
                            <ArrowLeft className='size-4' />
                            Back to homepage
                        </ButtonLink>
                    </div>
                </Container>
            </div>
        </>
    )
}
