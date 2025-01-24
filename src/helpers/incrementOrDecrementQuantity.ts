export default (quantity: number, step: number, min?: number, max?: number) => {
  let result = isNaN(quantity) ? 0 : quantity

  if (step > 0) {
    result = (Math.floor(result / step) + 1) * step
  } else {
    result = (Math.ceil(result / -step) - 1) * -step
  }

  if ((!!min || min === 0) && result < min) {
    result = min
  }

  if ((!!max || max === 0) && result > max) {
    result = max
  }

  return result
}
