import products from '../models/products.js'
import users from '../models/users.js'

export const createUser = async (req, res) => {
  try {
    // 較簡單的加密寫法
    // req.body.password = bcrypt(req.body.password)

    // model 裡的 .create() 的語法是 promise，所以這邊要用 async await
    let result = await users.create(req.body)
    // 將查詢結果的 mongoose Document 物件用 toObject 轉為一般的 {}
    result = result.toObject()
    // 移除密碼欄位，目的是不讓加密後的結果直接顯示給使用者看
    delete result.password
    // 移除密碼欄位後再顯示 result 結果
    res.status(200).json({ success: true, message: '', result })
    // 密碼欄位錯誤
  } catch (error) {
    console.log(error)
    // 錯誤會執行
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).json({ success: false, message })
      // 帳號已使用
    } else if (error.name === 'MongoServererror' && error.code === 11000) {
      res.status(409).json({ success: false, message: '帳號已被使用' })
      // 其他未知錯誤
    } else {
      res.status(500).json({ success: false, message: '未知錯誤' })
    }
  }
}
// 以 使用者 id 新增商品進購物車
export const addCart = async (req, res) => {
  try {
    // 用 id 尋找有沒有使用者，只取出 cart 欄位
    // https://mongoosejs.com/docs/api/query.html#query_Query-select
    const user = await users.findById(req.params.id, 'cart')
    if (!user) {
      res.status(404).json({ success: false, message: '找不到使用者' })
      // 不符合條件就 return 不再執行下面的 code
      return
    }

    // 檢查有沒有指定商品
    const product = await products.findById(req.body.product)
    if (!product) {
      res.status(404).json({ success: false, message: '找不到商品' })
      // 不符合條件就 return 不再執行下面的 code
      return
    }
    // 找使用者的購物車陣列內有沒有這個商品
    // product.p_id 這裡的 type 是 ObjectId req.body.product 這裡的 type 是 String 三個等於會不成立，因此要加上 .toString()
    const idx = user.cart.findIndex(product => product.p_id.toString() === req.body.product)
    // 購物車沒有就新增
    if (idx === -1) {
      user.cart.push({ p_id: req.body.product, quantity: req.body.quantity })
    } else {
      // 購物車內已經有就改數量
      user.cart[idx].quantity = req.body.quantity
    }
    // .save() 直接對拿出來的資料修改後保存
    await user.save()
    // result: user 這裡會使 user 的 password 也顯示出來，因此要在第 39 行： users.findById(req.params.id) 加上 cart ，過濾只回傳 cart 欄位 （或用 -account -password）
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

// 查詢單個使用者資料
export const getUser = async (req, res) => {
  try {
    // -password 不要密碼欄位
    // .populate(cart.p_id）是mongoose的功能，會自動關聯 cart.p_id 欄位的資料，必須要在 models 加上 ref
    // cart.p_id : models > user.js 裡，使用者的 schema 的 cart 裡面的 p_id ，有設定 ref：products 讓 mongoose 知道要去 products 撈資料，因此不需要跑迴圈
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
