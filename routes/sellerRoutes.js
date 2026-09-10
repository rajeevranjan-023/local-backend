import express from 'express'
import { protect, requireSeller } from '../middleware/auth.js'
import { startSellerAccount, getMySellerAccount, checkUsernameAvailability } from '../controllers/sellerController.js'
import {
  listMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js'
import { recordSale, listSales } from '../controllers/salesController.js'
import { getAnalytics } from '../controllers/analyticsController.js'
import {
  listCredits,
  addCredit,
  markCreditPaid,
  deleteCredit,
} from '../controllers/creditController.js'

const router = express.Router()

router.post('/start', protect, startSellerAccount)
router.get('/me', protect, getMySellerAccount)
router.get('/check-username/:username', protect, checkUsernameAvailability)

router.use(protect, requireSeller)

router.get('/products', listMyProducts)
router.post('/products', createProduct)
router.put('/products/:productId', updateProduct)
router.delete('/products/:productId', deleteProduct)

router.post('/sales', recordSale)
router.get('/sales', listSales)

router.get('/analytics', getAnalytics)

router.get('/credits', listCredits)
router.post('/credits', addCredit)
router.patch('/credits/:creditId/pay', markCreditPaid)
router.delete('/credits/:creditId', deleteCredit)

export default router
