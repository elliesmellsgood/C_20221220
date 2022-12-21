import { Router } from 'express'
import { createUser, addCart, getUser } from '../controllers/users.js'

const router = Router()

router.post('/', createUser)
router.post('/:id/cart', addCart)
router.get('/:id', getUser)

export default router
