export default (text?: string) => {
  if (!text) {
    return
  }

  return +text.replace(',', '.').replace(' ', '')
}
