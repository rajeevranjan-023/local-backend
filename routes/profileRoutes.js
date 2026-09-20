import express from 'express'
import { getProfileByUsername } from '../controllers/profileController.js'

const router = express.Router()
router.get('/:username', getProfileByUsername)

export default router 
 