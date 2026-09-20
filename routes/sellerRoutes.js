import express from 'express'
import { protect, requireSeller } from '../middleware/auth.js'

const router = express.Router()
router.use(protect, requireSeller)
// _________________________________________________________________________
import { 
  startSellerAccount, 
  getMySellerAccount, 
  checkUsernameAvailability } from '../controllers/sellerController.js'
router.post('/start', protect, startSellerAccount)
router.get('/me', protect, getMySellerAccount)
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
import { recordSale, listSales } from '../controllers/salesController.js'
router.post('/sales', recordSale)
router.get('/sales', listSales)

// _________________________________________________________________________
import { getAnalytics } from '../controllers/analyticsController.js'
router.get('/analytics', getAnalytics)

// _________________________________________________________________________
import {
  listCredits,
  addCredit,
  markCreditPaid,
  deleteCredit,} from '../controllers/creditController.js'
router.get('/credits', listCredits)
router.post('/credits', addCredit)
router.patch('/credits/:creditId/pay', markCreditPaid)
router.delete('/credits/:creditId', deleteCredit)

// _________________________________________________________________________
export default router
