import User from '../models/User.js'
import Shop from '../models/Shop.js'
import ServiceProvider from '../models/ServiceProvider.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { isValidUsernameFormat, normalizeUsername } from '../utils/username.js'

// _________________________________________________________________________
// =========================================================================
async function assertUsernameAvailable(rawUsername) {    //usernme valid and availbity check
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

// _________________________________________________________________________
// =========================================================================
// GET /api/seller/check-username/:username  (protected)
export const checkUsernameAvailability = asyncHandler(async (req, res) => {
  const result = await assertUsernameAvailable(req.params.username)
  res.json({ available: result.ok, message: result.ok ? null : result.error })
})

// _________________________________________________________________________
// =========================================================================
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

// _________________________________________________________________________
// =========================================================================
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
// _________________________________________________________________________
// =========================================================================

export const updateSellerAccount = asyncHandler(async (req, res) => {
  if (req.user.role !== 'seller') {
    return res.status(404).json({ message: 'No seller account yet.' })
  }

  if (req.user.sellerType === 'shop') {
    const shop = await Shop.findOne({ userId: req.user._id })
    if (!shop) return res.status(404).json({ message: 'Shop not found.' })

    const editable = [
      'shopName', 'ownerName', 'phone', 'email',
      'logoUrl', 'bannerUrl', 'description',
      'businessType', 'homeDelivery',
    ]
    editable.forEach((field) => {
      if (req.body[field] !== undefined) shop[field] = req.body[field]
    })

    if (req.body.address !== undefined) shop.location.address = req.body.address
    if (req.body.state !== undefined) shop.location.state = req.body.state
    if (req.body.district !== undefined) shop.location.district = req.body.district
    if (req.body.area !== undefined) shop.location.area = req.body.area

    if (req.body.openTime !== undefined) shop.timing.open = req.body.openTime
    if (req.body.closeTime !== undefined) shop.timing.close = req.body.closeTime
    if (req.body.openDays !== undefined) shop.timing.openDays = req.body.openDays

    await shop.save()
    return res.json({ sellerType: 'shop', account: shop.toPublicProfile() })
  }

  const provider = await ServiceProvider.findOne({ userId: req.user._id })
  if (!provider) return res.status(404).json({ message: 'Service profile not found.' })

  const editable = [
    'name', 'phone', 'email', 'bannerUrl', 'description', 'workType',
    'serviceArea', 'workingDays', 'timeSlots', 'availability',
  ]
  editable.forEach((field) => {
    if (req.body[field] !== undefined) provider[field] = req.body[field]
  })

  if (req.body.priceAmount !== undefined) provider.price.amount = req.body.priceAmount
  if (req.body.priceUnit !== undefined) provider.price.unit = req.body.priceUnit

  await provider.save()
  return res.json({ sellerType: 'service', account: provider.toPublicProfile() })
})
// _________________________________________________________________________
// =========================================================================