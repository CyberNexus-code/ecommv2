const SAST_TIME_ZONE = 'Africa/Johannesburg'

function getDateTimeParts(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const formatter = new Intl.DateTimeFormat('en-ZA', {
    timeZone: SAST_TIME_ZONE,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)

  const lookup = {
    day: parts.find((part) => part.type === 'day')?.value,
    month: parts.find((part) => part.type === 'month')?.value,
    year: parts.find((part) => part.type === 'year')?.value,
    hour: parts.find((part) => part.type === 'hour')?.value,
    minute: parts.find((part) => part.type === 'minute')?.value,
    second: parts.find((part) => part.type === 'second')?.value,
  }

  if (!lookup.day || !lookup.month || !lookup.year || !lookup.hour || !lookup.minute || !lookup.second) {
    return null
  }

  return lookup
}

export function formatSastDateTime(value: string | Date): string {
  const parts = getDateTimeParts(value)

  if (!parts) {
    return ''
  }

  return `${parts.day} ${parts.month} ${parts.year}, ${parts.hour}:${parts.minute}:${parts.second} SAST`
}