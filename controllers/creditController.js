import Credit from '../models/Credit.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// GET /api/seller/credits  (protected, shop sellers only)
export const listCredits = asyncHandler(async (req, res) => {
  if (req.sellerType !== 'shop') {
    return res.status(403).json({ message: 'Only shop accounts use the credit ledger.' })
  }
  const credits = await Credit.find({ shopId: req.sellerAccount._id }).sort({ createdAt: -1 })
  const totalDue = credits.filter((c) => !c.paid).reduce((sum, c) => sum + c.amount, 0)
  res.json({ credits, totalDue })
})

// POST /api/seller/credits  (protected)
export const addCredit = asyncHandler(async (req, res) => {
  if (req.sellerType !== 'shop') {
    return res.status(403).json({ message: 'Only shop accounts use the credit ledger.' })
  }
  const { customerName, phone, amount, dueDate, notes } = req.body
  if (!customerName || amount == null) {
    return res.status(400).json({ message: 'customerName and amount are required.' })
  }

  const credit = await Credit.create({
    shopId: req.sellerAccount._id,
    customerName,
    phone,
    amount,
    dueDate: dueDate || null,
    notes,
  })
  res.status(201).json(credit)
})

// PATCH /api/seller/credits/:creditId/pay  (protected) - mark as paid
export const markCreditPaid = asyncHandler(async (req, res) => {
  const credit = await Credit.findOne({ _id: req.params.creditId, shopId: req.sellerAccount._id })
  if (!credit) {
    return res.status(404).json({ message: 'Credit entry not found.' })
  }
  credit.paid = true
  await credit.save()
  res.json(credit)
})

// DELETE /api/seller/credits/:creditId  (protected)
export const deleteCredit = asyncHandler(async (req, res) => {
  const credit = await Credit.findOneAndDelete({ _id: req.params.creditId, shopId: req.sellerAccount._id })
  if (!credit) {
    return res.status(404).json({ message: 'Credit entry not found.' })
  }
  res.json({ message: 'Credit entry deleted.' })
})
