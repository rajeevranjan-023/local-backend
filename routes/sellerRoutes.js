import express from 'express'
import { protect, requireSeller } from '../middleware/auth.js'

const router = express.Router()
router.use(protect, requireSeller)
// _________________________________________________________________________
import { 
  startSellerAccount, 
  getMySellerAccount, 
  updateSellerAccount,
  checkUsernameAvailability } from '../controllers/sellerController.js'
router.post('/start', protect, startSellerAccount)
router.get('/me', protect, getMySellerAccount)
router.patch('/account', protect, updateSellerAccount)
router.get('/check-username/:username', protect, checkUsernameAvailability)

// _________________________________________________________________________
import {
  listMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,} from '../controllers/productController.js'
router.get('/products', listMyProducts)
router.post('/products', createProduct)
router.put('/products/:productId', updateProduct)
router.delete('/products/:productId', deleteProduct)

// _________________________________________________________________________
import { recordSale, listSales, updateSale } from '../controllers/salesController.js'
router.post('/sales', recordSale)
router.get('/sales', listSales)
router.put('/sales/:saleId', updateSale)

// _________________________________________________________________________
import { getAnalytics } from '../controllers/analyticsController.js'
router.get('/analytics', getAnalytics)

// _________________________________________________________________________
import {
  listCredits,
  addCredit,
  updateCredit,
  markCreditPaid,
  deleteCredit,} from '../controllers/creditController.js'
router.get('/credits', listCredits)
router.post('/credits', addCredit)
router.patch('/credits/:creditId', updateCredit)
router.patch('/credits/:creditId/pay', markCreditPaid)
router.delete('/credits/:creditId', deleteCredit)

// _________________________________________________________________________
export default router
