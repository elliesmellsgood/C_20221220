import { Schema, model } from 'mongoose'

const schema = new Schema({
  // 欄位
  // 商品名稱
  name: {
    type: String,
    required: [true, '缺少商品名稱']
  },
  // 價格
  price: {
    type: Number,
    required: [true, '缺少商品價格'],
    min: [0, '商品價格不能小於0']
  },
  // 類別
  category: {
    type: String,
    required: [true, '缺少商品分類'],
    // enum 限制這個欄位(category)的值只能是陣列裡的其中一個資料('皮件','鞋','上衣','飾品')
    enum: {
      values: ['皮件', '鞋', '上衣', '飾品'],
      // 固定寫法 {VALUE} 會自動取代成傳入的值
      message: '找不到 {VALUE} 這個分類'
    }
  }
  // {versionKey:false} => 讓顯示結果不會有 " __v 欄位"
}, { versionKey: false })

// 要加s，否則 mongoose 也會幫你加上
export default model('products', schema)
