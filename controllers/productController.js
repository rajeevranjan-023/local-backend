import Product from '../models/Product.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// _________________________________________________________________________
// =========================================================================
// GET /api/products  (public — trending products across all shops, for the homepage)
export const listAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().populate('shopId', 'shopName username').limit(30)
  res.json(
    products.map((p) => ({
      id: p._id,
      name: p.name,
      price: p.price,
      icon: p.icon,
      shopId: p.shopId?._id,
      shopName: p.shopId?.shopName || 'Unknown Shop',
      shopUsername: p.shopId?.username || null,
    }))
  )
})

// _________________________________________________________________________
// =========================================================================
// GET /api/seller/products  (protected, shop sellers only)
export const listMyProducts = asyncHandler(async (req, res) => {
  if (req.sellerType !== 'shop') {
    return res.status(403).json({ message: 'Only shop accounts have products.' })
  }
  const products = await Product.find({ shopId: req.sellerAccount._id }).sort({ createdAt: -1 })
  res.json(products)
})

// _________________________________________________________________________
// =========================================================================
// POST /api/seller/products  (protected)
export const createProduct = asyncHandler(async (req, res) => {
  if (req.sellerType !== 'shop') {
    return res.status(403).json({ message: 'Only shop accounts can add products.' })
  }
  const { name, price, costPrice, stock, icon } = req.body
  if (!name || price == null || costPrice == null) {
    return res.status(400).json({ message: 'name, price and costPrice are required.' })
  }

  const product = await Product.create({
    shopId: req.sellerAccount._id,
    name,
    price,
    costPrice,
    stock: stock ?? 0,
    icon: icon || '📦',
  })
  res.status(201).json(product)
})

// _________________________________________________________________________
// =========================================================================
// PUT /api/seller/products/:productId  (protected)
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.productId, shopId: req.sellerAccount._id })
  if (!product) {
    return res.status(404).json({ message: 'Product not found.' })
  }

  const { name, price, costPrice, stock, icon } = req.body
  if (name !== undefined) product.name = name
  if (price !== undefined) product.price = price
  if (costPrice !== undefined) product.costPrice = costPrice
  if (stock !== undefined) product.stock = stock
  if (icon !== undefined) product.icon = icon

  await product.save()
  res.json(product)
})

// _________________________________________________________________________
// =========================================================================
// DELETE /api/seller/products/:productId  (protected)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndDelete({
    _id: req.params.productId,
    shopId: req.sellerAccount._id,
  })
  if (!product) {
    return res.status(404).json({ message: 'Product not found.' })
  }
  res.json({ message: 'Product deleted.' })
})
// _________________________________________________________________________
// =========================================================================