import type { NextApiRequest, NextApiResponse } from 'next'
import { WEBSITE_PATTERN, INTERESTS } from '@/constants/contact'

interface ContactSubmission {
    name: string
    email: string
    company: string
    website?: string
    interests: string[]
    message: string
    nickname?: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    try {
        const body: ContactSubmission = req.body

        // Honeypot check: if bot filled 'nickname', silently pretend success
        if (body.nickname) {
            return res.status(200).json({ ok: true })
        }

        const { name, email, company, website, interests, message } = body

        // Validation
        if (!name?.trim()) return res.status(400).json({ message: 'Name is required' })
        if (!email?.trim() || !email.includes('@')) return res.status(400).json({ message: 'Valid work email is required' })
        if (!company?.trim()) return res.status(400).json({ message: 'Company name is required' })
        if (!message?.trim()) return res.status(400).json({ message: 'Project description is required' })
        if (website && !WEBSITE_PATTERN.test(website)) return res.status(400).json({ message: 'Invalid website format' })

        const validInterests = Array.isArray(interests)
            ? interests.filter(i => INTERESTS.includes(i))
            : []

        const submissionData = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            company: company.trim(),
            website: website?.trim() || null,
            interests: validInterests,
            message: message.trim(),
            created_at: new Date().toISOString()
        }

        console.log('[Contact Enquiry Received]:', submissionData)

        // 1. Supabase Storage (if configured)
        const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

        if (supabaseUrl && supabaseKey) {
            try {
                const response = await fetch(`${supabaseUrl}/rest/v1/inquiries`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(submissionData)
                })

                if (!response.ok) {
                    console.warn('[Supabase Insert Error]:', await response.text())
                } else {
                    console.log('[Supabase Insert Success]')
                }
            } catch (supaErr) {
                console.error('[Supabase Error]:', supaErr)
            }
        }

        // 2. Resend Email Notification (if configured)
        const resendKey = process.env.RESEND_API_KEY
        const recipientEmail = process.env.CONTACT_NOTIFICATION_EMAIL || 'hello@saharalabs.ai'

        if (resendKey) {
            try {
                const emailHtml = `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #080808; background: #ffffff;">
                        <h2 style="font-size: 24px; margin-bottom: 24px; border-bottom: 2px solid #6a00f5; padding-bottom: 12px;">New Contact Enquiry — SAHARA LABS</h2>
                        <p><strong>Name:</strong> ${submissionData.name}</p>
                        <p><strong>Work Email:</strong> <a href="mailto:${submissionData.email}">${submissionData.email}</a></p>
                        <p><strong>Company:</strong> ${submissionData.company}</p>
                        ${submissionData.website ? `<p><strong>Website:</strong> <a href="${submissionData.website}">${submissionData.website}</a></p>` : ''}
                        <p><strong>Looking for:</strong> ${submissionData.interests.join(', ') || 'Not specified'}</p>
                        <div style="margin-top: 24px; padding: 16px; background: #f8f6fc; border-left: 3px solid #6a00f5;">
                            <strong>Message:</strong><br />
                            <p style="white-space: pre-wrap; margin-top: 8px;">${submissionData.message}</p>
                        </div>
                    </div>
                `

                const resendRes = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${resendKey}`
                    },
                    body: JSON.stringify({
                        from: 'SAHARA LABS <onboarding@resend.dev>',
                        to: [recipientEmail],
                        reply_to: submissionData.email,
                        subject: `New Project Enquiry: ${submissionData.company} (${submissionData.name})`,
                        html: emailHtml
                    })
                })

                if (!resendRes.ok) {
                    console.warn('[Resend Error]:', await resendRes.text())
                } else {
                    console.log('[Resend Email Sent Successfully]')
                }
            } catch (resendErr) {
                console.error('[Resend Exception]:', resendErr)
            }
        }

        return res.status(200).json({ ok: true })
    } catch (err: unknown) {
        console.error('[Contact API Handler Error]:', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
