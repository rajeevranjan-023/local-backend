import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'

import { connectDB } from './config/db.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

import authRoutes from './routes/authRoutes.js'
import sellerRoutes from './routes/sellerRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import searchRoutes from './routes/searchRoutes.js'
import listingRoutes from './routes/listingRoutes.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Public listing + search (homepage & search page)
app.use('/api', listingRoutes)
app.use('/api/search', searchRoutes)

// Auth
app.use('/api/auth', authRoutes)

// Seller onboarding + private dashboard (products, sales, analytics, credit)
app.use('/api/seller', sellerRoutes)

// Unified public profile — GET /api/profile/:id (shop OR service, auto-detected)
app.use('/api/profile', profileRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

async function start() {
  await connectDB()
  app.listen(PORT, () => console.log(`🚀 Local Finder API running on http://localhost:${PORT}`))
}

if (process.env.NODE_ENV !== 'test') {
  start()
}

export default app
