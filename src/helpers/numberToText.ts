export default (quantity: number | null, numberOfDecimalPlaces = 2) => {
  if (quantity === null) {
    return null
  }

  return quantity
    .toFixed(numberOfDecimalPlaces)
    .replace('.', ',')
    .replace(/(,\d)(0)$/g, (...match) => `${match[1]}`)
    .replace(/,0$/g, '')
}
