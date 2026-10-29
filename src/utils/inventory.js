export function isOutOfStock(product) {
  return !product.available || (product.stock !== null && product.stock !== undefined && Number(product.stock) < 1)
}

export function isLowStock(product) {
  return product.stock !== null &&
    product.stock !== undefined &&
    Number.isFinite(Number(product.stock)) &&
    Number(product.stock) > 0 &&
    Number(product.stock) < 5
}

export function getStockLabel(product) {
  if (isOutOfStock(product)) return 'غير متوفر'
  if (isLowStock(product)) return `آخر ${product.stock} قطع`
  return 'متوفر'
}
