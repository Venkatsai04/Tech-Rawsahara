import type { AppProps } from 'next/app'
import { Host_Grotesk, DM_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { Layout } from '@/components/generals/layout'

const hostGrotesk = Host_Grotesk({
    subsets: ['latin'],
    variable: '--font-app-sans',
    display: 'swap'
})

const dmMono = DM_Mono({
    subsets: ['latin'],
    weight: ['400', '500'],
    variable: '--font-app-mono',
    display: 'swap'
})

export default function App({ Component, pageProps }: AppProps) {
    return (
        <div className={`${hostGrotesk.variable} ${dmMono.variable} min-h-screen flex flex-col font-sans`}>
            <style jsx global>{`
                :root {
                    --font-app-sans: ${hostGrotesk.style.fontFamily}, 'Host Grotesk', -apple-system, sans-serif;
                    --font-app-mono: ${dmMono.style.fontFamily}, 'DM Mono', monospace;
                    --font-app-heading: ${hostGrotesk.style.fontFamily}, 'Host Grotesk', -apple-system, sans-serif;
                }
            `}</style>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </div>
    )
}
