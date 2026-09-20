import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'



import { connectDB } from './config/db.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'







dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}
// _________________________________________________________________________
// =========================================================================
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Public listing + search (homepage & search page)
import listingRoutes from './routes/listingRoutes.js'
app.use('/api', listingRoutes)

import searchRoutes from './routes/searchRoutes.js'
app.use('/api/search', searchRoutes)

// Auth
import authRoutes from './routes/authRoutes.js'
app.use('/api/auth', authRoutes)

// Seller onboarding + private dashboard (products, sales, analytics, credit)
import sellerRoutes from './routes/sellerRoutes.js'
app.use('/api/seller', sellerRoutes)

// Unified public profile — GET /api/profile/:id (shop OR service, auto-detected)
import profileRoutes from './routes/profileRoutes.js'
app.use('/api/profile', profileRoutes)


// _________________________________________________________________________
// =========================================================================
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

async function start() {
  await connectDB()
  app.listen(PORT, () => console.log(`Local Finder API running on http://localhost:${PORT}`))
}

if (process.env.NODE_ENV !== 'test') {
  start()
}

export default app
