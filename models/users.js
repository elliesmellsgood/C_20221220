import { Schema, model, ObjectId, Error } from 'mongoose'
import validator from 'validator'
// 加密套件
import bcrypt from 'bcrypt'

const cartSchema = new Schema({
  // 商品 id
  p_id: {
    // ObjectId 指的是 mongoDB 的資料的 id
    type: ObjectId,
    // 這裡放的是來自 products 的 _id
    // 資料參照，查詢的時候會用到，指的是這個 id 是從 products 的 collection 來的，可以順便帶出指定 collection 資料，對應 controllers > users.js 第 84 行 .populate('cart.p_id'）
    ref: 'products',
    required: [true, '缺少商品 ID']
  },
  quantity: {
    type: Number,
    min: [0, '數量不能小於0'],
    required: [true, '缺少商品數量']
  }
})

const schema = new Schema({
  account: {
    type: String,
    required: [true, '缺少帳號'],
    minlength: [4, '帳號最少 4 個字'],
    maxlength: [20, '帳號最多 20 個字'],
    unique: true,
    validate: {
      validator (value) {
        // .isAlphanumeric 檢查是不是英數字
        return validator.isAlphanumeric(value)
      },
      message: '帳號只能是英數字'
    }
  },
  password: {
    type: String,
    required: true
  },
  cart: {
    // 資料型態是陣列，陣列每個東西的格式都是 cartSchema （參考第5行）
    type: [cartSchema]
  }
}, { versionKey: false })


// 資料新增．在資料保存之前執行加密的動作
// mongoose 的 middleware 保存之前執行一個 function
// 參數的 next 代表function 結束要進到下一步
// 這裡的 function 不能用箭頭函式 （因為this）
schema.pre('save', function (next) {
  // this 代表正要保存的資料
  const user = this
  // 把要存進去的資料加密，
  // 1. 如果密碼欄位有更改
  if (user.isModified('password')) {
    // 2. 檢查密碼格式
    if (user.password.length >= 4 && user.password.length <= 20) {
      // 加鹽 10 次
      user.password = bcrypt.hashSync(user.password, 10)
    } else {
      // 產生一個 Mongoose 的驗證錯誤
      // 驗證錯誤會跳到 controllers 的 .catch() 步驟
      const error = new Error.ValidationError(null)
      // 在密碼欄位新增一個錯誤 error.addError(發生錯誤的欄位名稱,發生錯誤的訊息)
      error.addError('password', new Error.ValidatorError({ message: '密碼長度錯誤' }))
      // 把錯誤帶進下一步
      next(error)
      return
    }
  }
  // 沒有錯會執行下一步
  next()
})

// 資料更新
schema.pre('findOneAndUpdate', function (next) {
  // this._update 代表正要保存的資料
  const user = this._update
  // 如果密碼欄位有更改
  if (user.password) {
    if (user.password.length >= 4 && user.password.length <= 20) {
      user.password = bcrypt.hashSync(user.password, 10)
    } else {
      // 產生一個 Mongoose 的驗證錯誤
      const error = new Error.ValidationError(null)
      error.addError('password', new Error.ValidatorError({ message: '密碼長度錯誤' }))
      next(error)
      return
    }
  }
  // function 執行完進到下一步
  next()
})

export default model('users', schema)
