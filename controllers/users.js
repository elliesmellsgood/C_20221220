import products from '../models/products.js'
import users from '../models/users.js'

export const createUser = async (req, res) => {
  try {
    // model 裡的 .create() 的語法是 promise，所以這邊要用 async await
    let result = await users.create(req.body)
    // 將查詢結果的 mongoose Document 物件用 toObject 轉為一般的 {}
    result = result.toObject()
    // 移除密碼欄位
    delete result.password
    res.status(200).json({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).json({ success: false, message })
    } else if (error.name === 'MongoServererror' && error.code === 11000) {
      res.status(409).json({ success: false, message: '帳號已被使用' })
    } else {
      res.status(500).json({ success: false, message: '未知錯誤' })
    }
  }
}
// 加入購物車
export const addCart = async (req, res) => {
  try {
    // 用 id 尋找有沒有使用者，只取出 cart 欄位
    // https://mongoosejs.com/docs/api/query.html#query_Query-select
    const user = await users.findById(req.params.id, 'cart')
    if (!user) {
      res.status(404).json({ success: false, message: '找不到使用者' })
      return
    }

    const product = await products.findById(req.body.product)
    if (!product) {
      res.status(404).json({ success: false, message: '找不到商品' })
      return
    }
    // 找使用者的購物車陣列內有沒有商品
    const idx = user.cart.findIndex(product => product.p_id.toString() === req.body.product)
    if (idx === -1) {
      // 購物車沒有就新增
      user.cart.push({ p_id: req.body.product, quantity: req.body.quantity })
    } else {
      // 購物車內有就改數量
      user.cart[idx].quantity += req.body.quantity
    }
    // .save() 直接對拿出來的資料修改後保存
    await user.save()
    res.status(200).json({ success: true, message: '', result: user })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).json({ success: false, message })
    } else if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'ID 格式錯誤' })
    } else {
      res.status(500).json({ success: false, message: '未知錯誤' })
    }
  }
}

export const getUser = async (req, res) => {
  try {
    const result = await users.findById(req.params.id, '-password').populate('cart.p_id')
    res.status(200).json({ success: true, message: '', result })
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'ID 格式錯誤' })
    } else {
      res.status(500).json({ success: false, message: '未知錯誤' })
      console.log(error)
    }
  }
}
