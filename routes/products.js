import { Router } from 'express'
import { createProduct, getProduct, getProducts } from '../controllers/products.js'
const router = Router()

// 根目錄 http://localhost:4000/products 用 ../controllers/products.js 去解析
router.post('/', createProduct)
router.get('/', getProducts)
router.get('/:id', getProduct)

export default router
