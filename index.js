import 'dotenv/config'
import mongoose from 'mongoose'
import express from 'express'
import MongoSanitize from 'express-mongo-sanitize'
import cors from 'cors'

import productsRoute from './routes/products.js'
import usersRoute from './routes/users.js'

mongoose.connect(process.env.DB_URL)
// 內建防資料庫攻擊 預設是 false 要改成 true
mongoose.set('sanitizeFilter', true)

const app = express()

app.use(cors())

app.use(express.json())

// 錯誤處理 => (帶入四個參數)
app.use((_, req, res, next) => {
  res.status(400).json({ success: false, message: '資料格式錯誤' })
})

// 要放在 express.json 後面
// 將 req.body, req.query or req.params 用_取代
app.use(MongoSanitize())

// 所有進到這個路徑的請求都交給 productsRoute 這個路由處理
app.use('/products', productsRoute)
app.use('/users', usersRoute)

app.all('*', (req, res) => {
  res.status(404).json({ success: false, massage: '找不到' })
})

app.listen(process.env.PORT || 4000, () => {
  console.log('伺服器開啟')
})
