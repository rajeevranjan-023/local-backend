import Shop from '../models/Shop.js'
import ServiceProvider from '../models/ServiceProvider.js'
import Product from '../models/Product.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { normalizeUsername } from '../utils/username.js'

// _________________________________________________________________________
// =========================================================================
// GET /api/profile/:username
export const getProfileByUsername = asyncHandler(async (req, res) => {

  const username = normalizeUsername(req.params.username)

  const shop = await Shop.findOne({ username })
  if (shop) {
    const products = await Product.find({ shopId: shop._id }).sort({ sold: -1 })
    const mostSellingId = products[0]?._id?.toString() || null
    return res.json({
      ...shop.toPublicProfile(),
      products: products.map((p) => ({
        id: p._id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        sold: p.sold,
        icon: p.icon,
        available: p.stock > 0,
        mostSelling: p._id.toString() === mostSellingId && p.sold > 0,
      })),
    })
  }

  const provider = await ServiceProvider.findOne({ username })
  if (provider) {
    return res.json(provider.toPublicProfile())
  }

  return res.status(404).json({ message: 'Profile not found.' })
})
// _________________________________________________________________________
// =========================================================================