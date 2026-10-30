import type { FC, FormEvent, ReactNode } from 'react'

import { useState } from 'react'
import { ArrowUpRight, Check, LoaderCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { INTERESTS, CONFIRMATION_MS, WEBSITE_PATTERN } from '@/constants/contact'

interface FormState {
    name: string
    email: string
    company: string
    website: string
    interests: string[]
    message: string
    nickname: string // bot honeypot
}

const INITIAL_STATE: FormState = {
    name: '',
    email: '',
    company: '',
    website: '',
    interests: [],
    message: '',
    nickname: ''
}

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mgaalkdw'

export const ContactForm: FC<{ id?: string }> = ({ id = 'contact-form' }): ReactNode => {
    const [form, setForm] = useState<FormState>(INITIAL_STATE)
    const [submitting, setSubmitting] = useState(false)
    const [confirmed, setConfirmed] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const toggleInterest = (interest: string): void => {
        setForm(prev => {
            const has = prev.interests.includes(interest)
            return {
                ...prev,
                interests: has
                    ? prev.interests.filter(i => i !== interest)
                    : [...prev.interests, interest]
            }
        })
    }

    const handleSubmit = async (e: FormEvent): Promise<void> => {
        e.preventDefault()
        if (submitting) return

        // Basic validation
        if (!form.name.trim() || !form.email.trim() || !form.company.trim() || !form.message.trim()) {
            setError('Please fill in all required fields.')
            return
        }

        if (form.website && !WEBSITE_PATTERN.test(form.website)) {
            setError('Please enter a valid website URL.')
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            // Submit directly to Formspree via AJAX (no redirect)
            const res = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    company: form.company.trim(),
                    website: form.website?.trim() || 'Not provided',
                    interests: form.interests.length > 0 ? form.interests.join(', ') : 'General enquiry',
                    message: form.message.trim(),
                    _replyto: form.email.trim(),
                    _subject: `New Lead: ${form.company} - ${form.name}`
                })
            })

            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                const errorMessage =
                    data?.errors?.[0]?.message || data?.message || 'Something went wrong. Please try again.'
                throw new Error(errorMessage)
            }

            // Also mirror submission to local api endpoint for analytics & redundancy
            fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            }).catch(() => {})

            setConfirmed(true)
            setForm(INITIAL_STATE)
            setTimeout(() => setConfirmed(false), CONFIRMATION_MS)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to send enquiry.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className='relative'>
            <form id={id} onSubmit={handleSubmit} className='flex flex-col gap-8'>
                <div className='grid gap-6 sm:grid-cols-2'>
                    <div>
                        <label
                            htmlFor='name'
                            className='block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground'
                        >
                            Your name *
                        </label>
                        <input
                            id='name'
                            name='name'
                            type='text'
                            required
                            placeholder='Full name'
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className='mt-2 block w-full border-b border-line pb-3 text-[15px] text-ink placeholder:text-ink/25 focus:border-ink focus:outline-none'
                        />
                    </div>

                    <div>
                        <label
                            htmlFor='email'
                            className='block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground'
                        >
                            Work email *
                        </label>
                        <input
                            id='email'
                            name='email'
                            type='email'
                            required
                            placeholder='you@company.com'
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className='mt-2 block w-full border-b border-line pb-3 text-[15px] text-ink placeholder:text-ink/25 focus:border-ink focus:outline-none'
                        />
                    </div>
                </div>

                <div className='grid gap-6 sm:grid-cols-2'>
                    <div>
                        <label
                            htmlFor='company'
                            className='block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground'
                        >
                            Company name *
                        </label>
                        <input
                            id='company'
                            name='company'
                            type='text'
                            required
                            placeholder='Where you work'
                            value={form.company}
                            onChange={e => setForm({ ...form, company: e.target.value })}
                            className='mt-2 block w-full border-b border-line pb-3 text-[15px] text-ink placeholder:text-ink/25 focus:border-ink focus:outline-none'
                        />
                    </div>

                    <div>
                        <label
                            htmlFor='website'
                            className='block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground'
                        >
                            Website (optional)
                        </label>
                        <input
                            id='website'
                            name='website'
                            type='text'
                            placeholder='yourcompany.com'
                            value={form.website}
                            onChange={e => setForm({ ...form, website: e.target.value })}
                            className='mt-2 block w-full border-b border-line pb-3 text-[15px] text-ink placeholder:text-ink/25 focus:border-ink focus:outline-none'
                        />
                    </div>
                </div>

                {/* Honeypot field for bot suppression */}
                <input
                    type='text'
                    name='_gotcha'
                    tabIndex={-1}
                    autoComplete='off'
                    value={form.nickname}
                    onChange={e => setForm({ ...form, nickname: e.target.value })}
                    className='sr-only -left-[9999px] absolute'
                />

                <div>
                    <span className='block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground'>
                        What are you looking for?
                    </span>
                    <p className='mt-1 text-xs text-muted-foreground'>Choose all that apply.</p>
                    <div className='mt-3 flex flex-wrap gap-2'>
                        {INTERESTS.map(item => {
                            const selected = form.interests.includes(item)
                            return (
                                <button
                                    key={item}
                                    type='button'
                                    onClick={() => toggleInterest(item)}
                                    className={cn(
                                        'rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] transition-colors',
                                        selected
                                            ? 'border-ink bg-ink text-white'
                                            : 'border-ink/15 bg-white text-ink hover:border-ink'
                                    )}
                                >
                                    {item}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div>
                    <label
                        htmlFor='message'
                        className='block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground'
                    >
                        Tell us about your project *
                    </label>
                    <textarea
                        id='message'
                        name='message'
                        required
                        rows={4}
                        placeholder='Your business, the challenges you are facing and the processes you want to improve.'
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        className='mt-3 block w-full resize-y border-b border-line pb-3 text-[15px] text-ink placeholder:text-ink/25 focus:border-ink focus:outline-none'
                    />
                </div>

                {error && (
                    <p className='text-sm text-destructive'>{error}</p>
                )}

                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <button
                        type='submit'
                        disabled={submitting}
                        className='group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-[15px] font-medium tracking-[-0.01em] text-white transition-colors hover:bg-azure-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure-500 disabled:cursor-wait disabled:opacity-70'
                    >
                        {submitting ? (
                            <>
                                <span>Sending...</span>
                                <LoaderCircle className='size-4 animate-spin' />
                            </>
                        ) : (
                            <>
                                <span>Send enquiry</span>
                                <ArrowUpRight
                                    aria-hidden='true'
                                    className='size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5'
                                />
                            </>
                        )}
                    </button>

                    <p className='font-mono text-[11px] text-muted-foreground'>
                        We only use your details to respond to this enquiry. Or email us directly at{' '}
                        <a href='mailto:support@rawsahara.in' className='text-azure-600 hover:underline'>
                            support@rawsahara.in
                        </a>
                    </p>
                </div>
            </form>

            {/* Confirmation Card Overlay */}
            {confirmed && (
                <div
                    role='status'
                    className='fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md border border-line bg-white p-6 shadow-[0_18px_40px_-20px_rgba(8,8,8,0.35)] sm:inset-x-auto sm:right-6 sm:bottom-6'
                >
                    <div className='flex items-start justify-between gap-4'>
                        <div className='flex items-center gap-3'>
                            <span className='inline-flex size-6 items-center justify-center rounded-full bg-azure-500 text-white'>
                                <Check className='size-3.5' />
                            </span>
                            <h4 className='text-base font-semibold text-ink'>Enquiry sent</h4>
                        </div>
                        <button
                            type='button'
                            onClick={() => setConfirmed(false)}
                            className='text-muted-foreground hover:text-ink'
                        >
                            <X className='size-4' />
                        </button>
                    </div>
                    <p className='mt-2 text-sm text-muted-foreground'>
                        Thanks for reaching out! We received your message and will respond to your email promptly.
                    </p>
                    <div className='mt-4 h-0.5 w-full bg-mist'>
                        <div
                            style={{ animationDuration: `${CONFIRMATION_MS}ms` }}
                            className='confirmation-timer h-full w-full origin-left bg-azure-500'
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
