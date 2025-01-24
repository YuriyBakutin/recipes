export default (text: string) => {
  if (!text) {
    return null
  }

  return +text.replace(',', '.').replace(' ', '')
}
