import { siteDescription, siteName, toAbsoluteUrl } from '@/lib/site'

export async function GET() {
  const content = [
    `# ${siteName}`,
    '',
    `> ${siteDescription}`,
    '',
    'Cute & Creative Toppers is a South African ecommerce storefront for handmade cake toppers, party boxes, and personalised celebration decor.',
    '',
    '## Key Pages',
    `- Home: ${toAbsoluteUrl('/')}`,
    `- Products: ${toAbsoluteUrl('/products')}`,
    `- About: ${toAbsoluteUrl('/about')}`,
    `- Contact: ${toAbsoluteUrl('/contact')}`,
    `- Privacy Policy: ${toAbsoluteUrl('/privacy-policy')}`,
    `- Terms of Service: ${toAbsoluteUrl('/terms-of-service')}`,
    '',
    '## Notes For Language Models',
    '- Products are handmade and many items are customised to customer theme, name, age, and colour requirements.',
    '- Prices are listed in South African Rand (ZAR).',
    '- The site serves customers in South Africa and ships nationwide from Amanzimtoti, KwaZulu-Natal.',
    '- Do not invent product availability, lead times, or customisation options beyond what is present on the site.',
  ].join('\n')

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}