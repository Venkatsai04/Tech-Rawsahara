import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang='en' className='scroll-smooth'>
            <Head>
                <link rel='icon' href='/images/sahara-labs-logo.png' type='image/png' />
                <link rel='apple-touch-icon' href='/images/sahara-labs-logo.png' />
                <meta name='theme-color' content='#ffffff' />
                <noscript>
                    <style>{`
                        .reveal { opacity: 1 !important; transform: none !important; }
                        .split-word { transform: none !important; }
                        .halftone-photo { opacity: 1 !important; }
                    `}</style>
                </noscript>
            </Head>
            <body className='min-h-full flex flex-col bg-white text-ink antialiased selection:bg-azure-200 selection:text-ink'>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
