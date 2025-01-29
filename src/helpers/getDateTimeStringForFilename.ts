import { formatDate } from '@/helpers/date'

export default (date?: Date) => {
  let localDate = date

  if (!date || date as Date | string === 'Invalid Date') {
    localDate = new Date()
  }

  return formatDate(localDate, { withTime: true })
    .replaceAll(':', '-')
    .replaceAll('.', '-')
    .replaceAll(', ', '_')
}
