import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    productionBrowserSourceMaps: false,
    typescript: {
        ignoreBuildErrors: true
    },
    images: {
        unoptimized: true
    }
}

export default nextConfig
