const defaultSiteUrl = 'https://cuteandcreativeco.co.za'

export const siteName = 'Cute & Creative Toppers'
export const siteShortName = 'Cute & Creative'
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? defaultSiteUrl).replace(/\/$/, '')
export const siteDescription =
  'Shop handmade cake toppers, party boxes, and custom celebration decor for birthdays, weddings, and special occasions across South Africa.'

export function toAbsoluteUrl(path = '/') {
  return new URL(path, `${siteUrl}/`).toString()
}