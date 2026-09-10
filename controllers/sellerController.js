import User from '../models/User.js'
import Shop from '../models/Shop.js'
import ServiceProvider from '../models/ServiceProvider.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { isValidUsernameFormat, normalizeUsername } from '../utils/username.js'

// Shared by both branches below: validate format, then check it isn't
// already taken by *any* user (usernames are unique across the whole
// platform, not just within shops or within services).
async function assertUsernameAvailable(rawUsername) {
  const username = normalizeUsername(rawUsername)

  if (!isValidUsernameFormat(username)) {
    return {
      ok: false,
      error:
        'Username must start with @, use only letters/numbers/underscore, and underscore can only go between characters (e.g. @rajeev_ranjan).',
    }
  }

  const taken = await User.findOne({ username })
  if (taken) {
    return { ok: false, error: 'That username is already taken.' }
  }

  return { ok: true, username }
}

// GET /api/seller/check-username/:username  (protected)
export const checkUsernameAvailability = asyncHandler(async (req, res) => {
  const result = await assertUsernameAvailable(req.params.username)
  res.json({ available: result.ok, message: result.ok ? null : result.error })
})

// POST /api/seller/start  (protected)
export const startSellerAccount = asyncHandler(async (req, res) => {
  if (req.user.role === 'seller') {
    return res.status(409).json({ message: 'You already have a seller account.' })
  }

  const { sellerType } = req.body

  const usernameCheck = await assertUsernameAvailable(req.body.username)
  if (!usernameCheck.ok) {
    return res.status(400).json({ message: usernameCheck.error })
  }
  const username = usernameCheck.username

  if (sellerType === 'shop') {
    const {
      shopName, ownerName, phone, email,
      logoUrl, bannerUrl, description, category,
      address, state, district, area, lat, lng,
      businessType, homeDelivery,
      openTime, closeTime, openDays,
    } = req.body

    if (!shopName || !ownerName || !phone || !address) {
      return res.status(400).json({ message: 'shopName, ownerName, phone and address are all required.' })
    }

    const shop = await Shop.create({
      userId: req.user._id,
      username,
      shopName,
      ownerName,
      phone,
      email,
      logoUrl,
      bannerUrl,
      description,
      category,
      location: { address, state, district, area, lat: lat ?? null, lng: lng ?? null },
      businessType,
      homeDelivery: !!homeDelivery,
      timing: { open: openTime || '09:00', close: closeTime || '21:00', openDays: openDays || 'Mon-Sat' },
    })

    req.user.role = 'seller'
    req.user.sellerType = 'shop'
    req.user.username = username
    await req.user.save()

    return res.status(201).json({
      user: req.user.toSafeObject(),
      account: shop.toPublicProfile(),
    })
  }

  if (sellerType === 'service') {
    const {
      name, phone, email, bannerUrl, description, workType,
      areas, serviceArea, priceAmount, priceUnit,
      workingDays, timeSlots, availability, lat, lng,
    } = req.body

    if (!name || !phone || !workType || !priceAmount) {
      return res.status(400).json({ message: 'name, phone, workType and priceAmount are required.' })
    }

    const provider = await ServiceProvider.create({
      userId: req.user._id,
      username,
      name,
      phone,
      email,
      bannerUrl,
      description,
      workType,
      areas: Array.isArray(areas) ? areas : [],
      serviceArea,
      price: { amount: priceAmount, unit: priceUnit || 'hour' },
      workingDays: workingDays || 'Mon-Sat',
      timeSlots,
      availability,
      location: { lat: lat ?? null, lng: lng ?? null },
    })

    req.user.role = 'seller'
    req.user.sellerType = 'service'
    req.user.username = username
    await req.user.save()

    return res.status(201).json({
      user: req.user.toSafeObject(),
      account: provider.toPublicProfile(),
    })
  }

  return res.status(400).json({ message: "sellerType must be 'shop' or 'service'." })
})

// GET /api/seller/me  (protected, seller only)
export const getMySellerAccount = asyncHandler(async (req, res) => {
  if (req.user.role !== 'seller') {
    return res.status(404).json({ message: 'No seller account yet.' })
  }

  const account =
    req.user.sellerType === 'shop'
      ? await Shop.findOne({ userId: req.user._id })
      : await ServiceProvider.findOne({ userId: req.user._id })

  if (!account) {
    return res.status(404).json({ message: 'Seller account not found.' })
  }

  res.json({ sellerType: req.user.sellerType, account: account.toPublicProfile() })
})
