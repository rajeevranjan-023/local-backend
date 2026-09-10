import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Shop from '../models/Shop.js'
import ServiceProvider from '../models/ServiceProvider.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, please log in.' })
  }

  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' })
    }
    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Session expired or invalid, please log in again.' })
  }
})

export const requireSeller = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Only sellers can access this. Finish "Start Yours" first.' })
  }

  const account =
    req.user.sellerType === 'shop'
      ? await Shop.findOne({ userId: req.user._id })
      : await ServiceProvider.findOne({ userId: req.user._id })

  if (!account) {
    return res.status(404).json({ message: 'Seller account not found.' })
  }

  req.sellerAccount = account
  req.sellerType = req.user.sellerType
  next()
})
