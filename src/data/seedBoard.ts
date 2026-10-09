import type {
  AppIconRef,
  Board,
  BoardEdge,
  BoardNode,
  ColumnData,
  Section,
} from '../types';
import { uid } from '../utils/id';

const b = (slug: string): AppIconRef => ({ kind: 'builtin', slug });

function section(title: string, columns: string[][]): Section {
  return { id: uid('sec'), title, columns };
}

function column(
  title: string,
  objective: string,
  tools: string[],
  sections: Section[],
): ColumnData {
  return {
    kind: 'column',
    title,
    objective,
    tools: tools.map(b),
    sections,
  };
}

export function seedBoards(): Board[] {
  const rootId = uid('root');

  const clusterDefs: Array<{ label: string; icons: string[]; x: number }> = [
    {
      label: 'Strategy & Planning',
      x: -2340,
      icons: ['notion', 'miro', 'figma', 'googledocs', 'trello', 'asana', 'airtable', 'linear', 'clickup', 'obsidian', 'googlesheets', 'slack'],
    },
    {
      label: 'Production',
      x: -1780,
      icons: ['canva', 'adobephotoshop', 'adobeillustrator', 'adobepremierepro', 'framer', 'sketch', 'blender', 'unity', 'loom', 'vimeo', 'figma'],
    },
    {
      label: 'Distribution',
      x: -1220,
      icons: ['youtube', 'instagram', 'tiktok', 'linkedin', 'x', 'facebook', 'pinterest', 'reddit', 'substack', 'medium', 'ghost', 'wordpress', 'mailchimp'],
    },
    {
      label: 'Advertising',
      x: 560,
      icons: ['googleads', 'meta', 'facebook', 'instagram', 'tiktok', 'semrush', 'hootsuite', 'buffer', 'hotjar'],
    },
    {
      label: 'Monetization',
      x: 1120,
      icons: ['stripe', 'paypal', 'shopify', 'woocommerce', 'gumroad', 'lemonsqueezy', 'square', 'xero', 'quickbooks', 'patreon', 'buymeacoffee', 'kofi'],
    },
    {
      label: 'Customer Relationship',
      x: 1680,
      icons: ['hubspot', 'salesforce', 'zendesk', 'intercom', 'calendly', 'typeform', 'surveymonkey', 'zoom', 'discord', 'whatsapp', 'telegram', 'gmail'],
    },
    {
      label: 'Analytics',
      x: 2240,
      icons: ['googleanalytics', 'googlesearchconsole', 'mixpanel', 'hotjar', 'semrush', 'googlesheets', 'supabase', 'notion', 'toggl', 'clockify'],
    },
  ];

  const clusterNodes: BoardNode[] = clusterDefs.map((c) => ({
    id: uid('cluster'),
    type: 'cluster',
    position: { x: c.x, y: 0 },
    data: { kind: 'cluster', label: c.label, icons: c.icons.map(b) },
  }));

  const root: BoardNode = {
    id: rootId,
    type: 'root',
    position: { x: -230, y: 20 },
    data: {
      kind: 'root',
      name: 'Marketing Framework',
      industry: 'Business Operating System',
      statement:
        'One board that maps the whole business — strategy through execution. Every tool, objective, process and metric lives in one place so the team always knows what to do next.',
    },
  };

  const columnDefs: Array<{ x: number; data: ColumnData }> = [
    {
      x: -2220,
      data: column(
        'BRAND STRATEGY',
        'Define who we are, what we stand for, and how we show up consistently across every channel.',
        ['figma', 'canva', 'notion', 'googledocs'],
        [
          section('Positioning', [
            ['Niche selection', 'ICP definition', 'Category design'],
            ['Differentiation', 'Value proposition', 'Brand promise'],
          ]),
          section('Messaging', [
            ['Mission & vision', 'Tone of voice', 'Tagline'],
            ['Story pillars', 'Objection handling', 'Proof points'],
          ]),
          section('Visual Identity', [
            ['Logo system', 'Color palette', 'Typography'],
            ['Photography style', 'Templates', 'Brand guide'],
          ]),
        ],
      ),
    },
    {
      x: -1520,
      data: column(
        'OFFER STRATEGY',
        'Build an offer stack that is easy to say yes to — clear outcomes, clear pricing, clear risk reversal.',
        ['stripe', 'notion', 'googlesheets'],
        [
          section('Core Offer', [
            ['Problem → outcome', 'Delivery mechanism', 'Guarantee'],
            ['Pricing strategy', 'Payment plans', 'Scarcity levers'],
          ]),
          section('Upsells', [
            ['Order bumps', 'One-click upsells', 'Downsells'],
            ['Cross-sells', 'Bundles', 'Retention offers'],
          ]),
          section('Pricing Strategy', [
            ['Anchor pricing', 'Tiered plans', 'Value metric'],
            ['Discount policy', 'Annual vs monthly', 'Price testing'],
          ]),
        ],
      ),
    },
    {
      x: -820,
      data: column(
        'CONTENT STRATEGY',
        'Turn expertise into a repeatable content engine that compounds attention and trust.',
        ['notion', 'canva', 'loom', 'buffer'],
        [
          section('Content Pillars', [
            ['Education', 'Authority', 'Behind the scenes'],
            ['Entertainment', 'Engagement', 'Promotion'],
          ]),
          section('Platform Strategy', [
            ['Long-form (YouTube)', 'Short-form (Reels/TikTok)', 'Written (Newsletter)'],
            ['Repurposing workflow', 'Publishing cadence', 'Batch production'],
          ]),
          section('Content Process', [
            ['Ideation bank', 'Scripting framework', 'Hook library'],
            ['Editing standards', 'Thumbnail system', 'CTA mapping'],
          ]),
        ],
      ),
    },
    {
      x: -120,
      data: column(
        'TRAFFIC & LEAD GENERATION',
        'Create predictable, compounding traffic and convert strangers into leads with assets we own.',
        ['googleads', 'mailchimp', 'semrush'],
        [
          section('Organic', [
            ['SEO foundations', 'Blog engine', 'Social distribution'],
            ['Collaborations', 'PR & features', 'Community'],
          ]),
          section('Paid', [
            ['Campaign structure', 'Creative testing', 'Audience research'],
            ['Budget rules', 'Retargeting', 'Landing pages'],
          ]),
          section('Lead Magnets', [
            ['Core magnet', 'Tripwire offer', 'Opt-in flow'],
            ['Nurture sequence', 'Lead scoring', 'List hygiene'],
          ]),
        ],
      ),
    },
    {
      x: 580,
      data: column(
        'SALES & CONVERSION',
        'Convert demand into revenue with a sales process that is measurable at every step.',
        ['hubspot', 'calendly', 'stripe'],
        [
          section('Sales Process', [
            ['Lead capture', 'Qualification', 'Discovery call'],
            ['Demo / pitch', 'Objection handling', 'Close'],
          ]),
          section('Conversion Assets', [
            ['Sales page', 'Case studies', 'Testimonials'],
            ['FAQ & risk reversal', 'Proposal templates', 'Contracts'],
          ]),
          section('Follow-up', [
            ['Speed to lead', 'Follow-up cadence', 'Reactivation'],
            ['Abandoned cart', 'Win-back offers', 'Referral ask'],
          ]),
        ],
      ),
    },
    {
      x: 1280,
      data: column(
        'CUSTOMER GROWTH',
        'Deliver a great result, then grow the account — retention and referrals beat acquisition.',
        ['intercom', 'notion', 'slack'],
        [
          section('Onboarding', [
            ['Welcome sequence', 'Kickoff call', 'Quick wins'],
            ['Milestones', 'Success plan', 'Expectation setting'],
          ]),
          section('Retention', [
            ['Health scoring', 'QBRs / reviews', 'Support SLAs'],
            ['Community', 'Education hub', 'Renewal motion'],
          ]),
          section('Advocacy', [
            ['Referral program', 'Affiliates', 'Reviews & UGC'],
            ['Case study pipeline', 'Partnerships', 'Advisory board'],
          ]),
        ],
      ),
    },
    {
      x: 1980,
      data: column(
        'ANALYTICS & OPS',
        'Instrument the business so every decision is backed by a number and a dashboard.',
        ['googleanalytics', 'googlesheets', 'notion'],
        [
          section('KPI Framework', [
            ['North star metric', 'Input metrics', 'Leading vs lagging'],
            ['Weekly scorecard', 'Targets', 'Alerts'],
          ]),
          section('Reporting', [
            ['Dashboard stack', 'Attribution model', 'Experiment log'],
            ['Monthly review', 'Post-mortems', 'Forecasting'],
          ]),
          section('Operations', [
            ['SOPs & playbooks', 'Tool stack', 'Automation map'],
            ['Roles & ownership', 'Meeting rhythm', 'Budget control'],
          ]),
        ],
      ),
    },
  ];

  const columnNodes: BoardNode[] = columnDefs.map((c) => ({
    id: uid('col'),
    type: 'column',
    position: { x: c.x, y: 620 },
    data: c.data,
    width: 620,
  }));

  const nodes: BoardNode[] = [...clusterNodes, root, ...columnNodes];
  const edges: BoardEdge[] = columnNodes.map((c) => ({
    id: uid('e'),
    source: rootId,
    target: c.id,
    type: 'trunk',
  }));

  return [
    {
      id: uid('board'),
      name: 'Marketing',
      nodes,
      edges,
      viewport: { x: 900, y: 200, zoom: 0.32 },
    },
  ];
}