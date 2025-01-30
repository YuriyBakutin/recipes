export default (quantity?: number, numberOfDecimalPlaces = 2) => {
  if (Number.isNaN(quantity)) {
    return
  }

  return (quantity as number)
    .toFixed(numberOfDecimalPlaces)
    .replace('.', ',')
    .replace(/(,\d)(0)$/g, (...match) => `${match[1]}`)
    .replace(/,0$/g, '')
}
