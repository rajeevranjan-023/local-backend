import Product from '../models/Product.js'
import ServiceProvider from '../models/ServiceProvider.js'
import Shop from '../models/Shop.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// GET /api/search?q=fan
export const search = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim()
  if (!q) {
    return res.json({ products: [], services: [], shops: [] })
  }

  const regex = new RegExp(q, 'i')

  const products = await Product.find({ name: regex }).populate('shopId', 'shopName username').limit(30)
  const sortedProducts = [...products].sort((a, b) => a.price - b.price)
  const cheapestId = sortedProducts[0]?._id?.toString() || null

  const services = await ServiceProvider.find({ workType: regex }).limit(20)
  const shops = await Shop.find({ shopName: regex }).limit(20)

  res.json({
    products: sortedProducts.map((p) => ({
      id: p._id,
      name: p.name,
      price: p.price,
      icon: p.icon,
      shopId: p.shopId?._id,
      shopName: p.shopId?.shopName || 'Unknown Shop',
      shopUsername: p.shopId?.username || null,
      cheapest: p._id.toString() === cheapestId,
    })),
    services: services.map((s) => s.toPublicProfile()),
    shops: shops.map((s) => s.toPublicProfile()),
  })
})
 