import Product from '../models/Product.js'
import Sale from '../models/Sale.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// _________________________________________________________________________
// =========================================================================
export const recordSale = asyncHandler(async (req, res) => {
  if (req.sellerType !== 'shop') {
    return res.status(403).json({ message: 'Only shop accounts can record sales.' })
  }

  const { productId, quantity, channel, customerName } = req.body
  if (!productId || !quantity) {
    return res.status(400).json({ message: 'productId and quantity are required.' })
  }

  const product = await Product.findOne({ _id: productId, shopId: req.sellerAccount._id })
  if (!product) {
    return res.status(404).json({ message: 'Product not found.' })
  }
  if (product.stock < quantity) {
    return res.status(400).json({ message: `Only ${product.stock} in stock.` })
  }

  const sale = await Sale.create({
    shopId: req.sellerAccount._id,
    productId: product._id,
    quantity,
    priceAtSale: product.price,
    costAtSale: product.costPrice,
    channel: channel === 'online' ? 'online' : 'offline',
    customerName: customerName || '',
  })

  product.stock -= quantity
  product.sold += quantity
  await product.save()

  res.status(201).json(sale)
})

// _________________________________________________________________________
// =========================================================================
// GET /api/seller/sales  (protected, shop sellers only)
export const listSales = asyncHandler(async (req, res) => {
  if (req.sellerType !== 'shop') {
    return res.status(403).json({ message: 'Only shop accounts have sales.' })
  }
  const sales = await Sale.find({ shopId: req.sellerAccount._id })
    .populate('productId', 'name icon')
    .sort({ createdAt: -1 })
    .limit(100)
  res.json(sales)
})
// _________________________________________________________________________
// =========================================================================