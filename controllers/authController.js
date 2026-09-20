import User from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// _________________________________________________________________________
// =========================================================================
// POST /api/auth/register
export const register = asyncHandler(async (req, res) => { 
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are all required.' })
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists.' })
  }

  const user = await User.create({ name, email, password })

  res.status(201).json({
    user: user.toSafeObject(),
    token: generateToken(user._id),
  })
})

// _________________________________________________________________________
// =========================================================================
// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password.' })
  }

  res.json({
    user: user.toSafeObject(),
    token: generateToken(user._id),
  })
})

// _________________________________________________________________________
// =========================================================================
// GET /api/auth/me  (protected)
export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeObject() })
})

// _________________________________________________________________________
// =========================================================================
// PATCH /api/auth/location  (protected)
export const updateLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ message: 'lat and lng must both be numbers.' })
  }

  req.user.location = { lat, lng, updatedAt: new Date() }
  await req.user.save()

  res.json({ user: req.user.toSafeObject() })
})
// _________________________________________________________________________
// =========================================================================
