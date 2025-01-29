interface IDateToStringOptions {
  year?: 'numeric' | '2-digit',
  month?: 'numeric' | '2-digit',
  day?: 'numeric' | '2-digit',
  hour?: 'numeric' | '2-digit',
  minute?: 'numeric' | '2-digit',
  second?: 'numeric' | '2-digit',
}

export const formatDate = (
  date?: string | number | Date | null,
  options = { withTime: false }
) => {
  if (!date || date as Date | string === 'Invalid Date') {
    return ''
  }

  let dateObj: Date

  if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date)
  } else {
    dateObj = date
  }

  const dateToStringOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  } as IDateToStringOptions

  if (options.withTime) {
    dateToStringOptions.hour = 'numeric'
    dateToStringOptions.minute = 'numeric'
    dateToStringOptions.second = 'numeric'
  }

  return `${dateObj.toLocaleDateString('ru-RU', dateToStringOptions)}`
}

