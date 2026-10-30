import type { LucideIcon } from 'lucide-react'
import {
    Bot,
    CalendarCheck,
    Database,
    Filter,
    MessageCircle,
    PhoneCall,
    Repeat,
    Search,
    UserCheck,
    Workflow
} from 'lucide-react'

export interface NavLink {
    label: string
    href: string
}

export const NAV_LINKS: NavLink[] = [
    { label: 'Work', href: '/#work' },
    { label: 'Services', href: '/#services' },
    { label: 'Process', href: '/#process' },
    { label: 'Studio', href: '/#studio' },
    { label: 'Contact', href: '/contact' }
]

export interface Outcome {
    number: string
    title: string
    description: string
}

export const OUTCOMES: Outcome[] = [
    {
        number: '01',
        title: 'More opportunities',
        description: 'Systems that find, enrich and qualify leads, so your pipeline is built on the right prospects.'
    },
    {
        number: '02',
        title: 'Faster responses',
        description: 'Every enquiry gets a prompt, consistent reply by voice, chat or WhatsApp, whatever the hour.'
    },
    {
        number: '03',
        title: 'Less manual work',
        description: 'Follow-ups, data entry and handoffs run in the background, so your team can focus on people.'
    }
]

export interface Capability {
    label: string
    icon: LucideIcon
}

export const CAPABILITIES: Capability[] = [
    { label: 'Prospect research', icon: Search },
    { label: 'Data enrichment', icon: Database },
    { label: 'Lead qualification', icon: Filter },
    { label: 'n8n workflows', icon: Workflow },
    { label: 'CRM automation', icon: Repeat },
    { label: 'AI agents', icon: Bot },
    { label: 'Inbound and outbound calls', icon: PhoneCall },
    { label: 'Appointment booking', icon: CalendarCheck },
    { label: 'WhatsApp automation', icon: MessageCircle },
    { label: 'Human handoff', icon: UserCheck }
]

export interface PipelineStage {
    label: string
    stop: number
}

export const PIPELINE_STAGES: PipelineStage[] = [
    { label: 'Capture', stop: 0.22 },
    { label: 'Qualify', stop: 0.44 },
    { label: 'Follow up', stop: 0.66 },
    { label: 'Book', stop: 0.88 }
]

export interface Service {
    number: string
    title: string
    description: string
    capabilities: string[]
    motif: 'globe' | 'stream' | 'voice' | 'ripple'
}

export const SERVICES: Service[] = [
    {
        number: '01',
        title: 'Lead Generation Systems',
        description:
            'Find the right prospects, collect relevant data and create structured workflows that generate meaningful sales opportunities.',
        capabilities: [
            'Prospect research',
            'Lead sourcing',
            'Data enrichment',
            'Lead qualification',
            'Outreach workflows'
        ],
        motif: 'globe'
    },
    {
        number: '02',
        title: 'AI Workflow Automation',
        description:
            'Connect business tools and automate repetitive processes using n8n, APIs and AI agents.',
        capabilities: [
            'n8n workflow development',
            'AI agents',
            'CRM automation',
            'Lead follow-ups',
            'Business process automation'
        ],
        motif: 'stream'
    },
    {
        number: '03',
        title: 'AI Voice Agents',
        description:
            'Build AI-powered voice agents that handle customer conversations and help businesses respond at scale.',
        capabilities: [
            'Inbound calls',
            'Outbound calls',
            'Lead qualification',
            'Appointment booking',
            'Call routing and handoff'
        ],
        motif: 'voice'
    },
    {
        number: '04',
        title: 'Customer Support Systems',
        description:
            'Create connected customer support systems that help businesses manage enquiries and respond faster.',
        capabilities: [
            'WhatsApp automation',
            'AI customer support',
            'Enquiry management',
            'Automated responses',
            'Human handoff'
        ],
        motif: 'ripple'
    }
]

export interface ProjectStep {
    title: string
    text: string
}

export interface Project {
    slug: string
    number: string
    category: string
    title: string
    summary: string
    tags: string[]
    image: string
    imageAlt: string
    focusX: number
    focusY: number
    challenge: string
    approach: string
    steps: ProjectStep[]
    includes: string[]
}

export const PROJECTS: Project[] = [
    {
        slug: 'sales-agency-lead-generation',
        number: '01',
        category: 'Sales Agency',
        title: 'Automated lead generation for an outbound sales team',
        summary: 'Automated lead generation workflows that help identify prospects and organise outreach.',
        tags: ['Lead generation', 'Data enrichment', 'Outreach workflows'],
        image: '/images/work-sales-agency.jpg',
        imageAlt: 'A sales team working at laptops in a bright office',
        focusX: 0.5,
        focusY: 0.45,
        challenge:
            'Prospect research was manual. Building lists, checking each company and copying details between tools took hours that should have gone into selling.',
        approach:
            'We built a workflow that sources prospects against an agreed ideal customer profile, enriches each record with the details the team needs, scores it and places it in the right outreach sequence.',
        steps: [
            { title: 'Source', text: 'Find companies and contacts that match the agreed customer profile.' },
            { title: 'Enrich', text: 'Add company data, roles and contact details, checked before they are used.' },
            { title: 'Qualify', text: 'Score each lead against clear criteria and set poor fits aside.' },
            { title: 'Organise', text: 'Push qualified leads into the CRM and outreach sequences, ready for the team.' }
        ],
        includes: ['Prospect research workflow', 'Data enrichment', 'Lead scoring rules', 'CRM and outreach sync']
    },
    {
        slug: 'ecommerce-order-confirmation',
        number: '02',
        category: 'E-commerce',
        title: 'AI voice calls that confirm cash-on-delivery orders',
        summary: 'AI voice calling workflows for cash-on-delivery order verification and customer confirmation.',
        tags: ['AI voice agents', 'Order verification', 'Store integration'],
        image: '/images/work-ecommerce.jpg',
        imageAlt: 'Shipping cases lined up against a plain wall',
        focusX: 0.5,
        focusY: 0.55,
        challenge:
            'Cash-on-delivery orders need confirming before they ship. Calling every customer by hand is slow, and unconfirmed orders lead to failed deliveries and wasted shipping.',
        approach:
            'A voice agent calls each new cash-on-delivery order, confirms the details with the customer and records the outcome on the order, so only confirmed orders move on to fulfilment.',
        steps: [
            { title: 'Trigger', text: 'A new cash-on-delivery order starts the workflow automatically.' },
            {
                title: 'Call',
                text: 'The AI voice agent calls the customer to confirm the order, address and delivery details.'
            },
            { title: 'Record', text: 'The outcome is written back to the order: confirmed, changed or cancelled.' },
            { title: 'Hand off', text: 'Anything unclear is routed to a person to follow up.' }
        ],
        includes: [
            'Outbound AI voice agent',
            'Store and order integration',
            'Call outcome tracking',
            'Human follow-up queue'
        ]
    },
    {
        slug: 'recruitment-candidate-research',
        number: '03',
        category: 'Recruitment Agency',
        title: 'Lead generation and candidate research for recruiters',
        summary: 'Recruitment lead-generation workflows and automated candidate research.',
        tags: ['Lead generation', 'Research automation', 'AI agents'],
        image: '/images/work-recruitment.jpg',
        imageAlt: 'A recruiter working at a clean desk with a computer',
        focusX: 0.5,
        focusY: 0.4,
        challenge:
            'Recruiters were splitting their time between finding hiring companies and researching candidates, two slow and repetitive jobs spread across many tabs.',
        approach:
            'Two connected workflows: one finds companies showing hiring signals and prepares them for business development, the other researches candidate profiles against a role brief and summarises the strongest matches.',
        steps: [
            { title: 'Signal', text: 'Spot companies that are actively hiring for relevant roles.' },
            { title: 'Research', text: 'Gather company and candidate information from the agreed sources.' },
            { title: 'Summarise', text: 'AI agents condense each profile against the role brief.' },
            { title: 'Deliver', text: "Results land in the team's CRM or sheets, ready to act on." }
        ],
        includes: [
            'Hiring signal workflow',
            'Candidate research agent',
            'Role brief matching',
            'CRM delivery'
        ]
    },
    {
        slug: 'ai-chatbot-multi-agent-workflows',
        number: '04',
        category: 'AI Infrastructure',
        title: 'AI chatbots and multi-agent workflows for business operations',
        summary: 'AI chatbot and multi-agent business workflow systems.',
        tags: ['AI agents', 'Chatbots', 'Workflow automation'],
        image: '/images/work-ai-infrastructure.jpg',
        imageAlt: 'Rows of glass-fronted server racks in a bright data centre',
        focusX: 0.5,
        focusY: 0.5,
        challenge:
            'Routine questions and moving information between systems took up time across the business, with knowledge spread over documents and tools.',
        approach:
            "A chatbot grounded in the business's own knowledge answers routine questions, while specialised agents handle tasks such as triage, data lookup and updates, passing work between them.",
        steps: [
            { title: 'Ask', text: 'A question or task arrives through chat.' },
            { title: 'Route', text: 'An orchestrating agent decides which specialist should handle it.' },
            { title: 'Act', text: 'Agents look up data, draft answers or update connected tools.' },
            { title: 'Review', text: 'Anything uncertain is flagged for a person to check.' }
        ],
        includes: [
            'Knowledge-based chatbot',
            'Multi-agent orchestration',
            'Tool and API connections',
            'Human review steps'
        ]
    },
    {
        slug: 'real-estate-whatsapp-qualification',
        number: '05',
        category: 'Real Estate',
        title: 'WhatsApp lead qualification for property enquiries',
        summary:
            'WhatsApp-based AI lead qualification to capture enquiries, understand requirements and route qualified prospects.',
        tags: ['WhatsApp automation', 'Lead qualification', 'Routing'],
        image: '/images/work-real-estate.jpg',
        imageAlt: 'A modern apartment building with balconies against a clear sky',
        focusX: 0.5,
        focusY: 0.5,
        challenge:
            'Property enquiries arrive at all hours, and agents lose time asking the same first questions before knowing whether a lead is a fit.',
        approach:
            'An AI assistant on WhatsApp replies straight away, asks about budget, location, timing and property type, then routes qualified prospects to the right agent with a summary of the conversation.',
        steps: [
            { title: 'Capture', text: 'Enquiries from listings and ads open a WhatsApp conversation.' },
            { title: 'Understand', text: 'The assistant asks about requirements in a natural back and forth.' },
            { title: 'Qualify', text: 'Answers are checked against the agreed criteria.' },
            { title: 'Route', text: 'Qualified prospects go to the right agent with a summary, logged in the CRM.' }
        ],
        includes: [
            'WhatsApp AI assistant',
            'Qualification logic',
            'Agent routing and handoff',
            'CRM logging'
        ]
    }
]

export interface ProcessStep {
    number: string
    title: string
    focus: string
    description: string
}

export const PROCESS_STEPS: ProcessStep[] = [
    {
        number: '01',
        title: 'Discover',
        focus: 'Process audit',
        description: 'Understand the business, existing processes and where opportunities or time are being lost.'
    },
    {
        number: '02',
        title: 'Design',
        focus: 'Workflow map',
        description: 'Map the workflow, define the solution and identify the necessary integrations.'
    },
    {
        number: '03',
        title: 'Build',
        focus: 'Live system',
        description: 'Develop the automation, AI agents and integrations.'
    },
    {
        number: '04',
        title: 'Improve',
        focus: 'Ongoing refinement',
        description: 'Test, monitor and refine the system based on actual business usage.'
    }
]
