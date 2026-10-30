import type { FC, ReactNode } from 'react'
import { useMemo } from 'react'
import { DotCanvas } from '@/components/dots/dot-canvas'
import {
    createGlobeField,
    createRippleField,
    createStreamField,
    createVoiceField
} from '@/lib/dots/fields'

interface ServiceMotifProps {
    motif: 'globe' | 'stream' | 'voice' | 'ripple'
}

export const ServiceMotif: FC<ServiceMotifProps> = ({ motif }): ReactNode => {
    const field = useMemo(() => {
        switch (motif) {
            case 'globe':
                return createGlobeField(11)
            case 'ripple':
                return createRippleField()
            case 'voice':
                return createVoiceField(7)
            case 'stream':
            default:
                return createStreamField(5)
        }
    }, [motif])

    return <DotCanvas field={field} grid={true} cell={6} mobileCell={5} startTime={4} />
}
