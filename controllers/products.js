import products from '../models/products.js'

// 查全部
export const createProduct = async (req, res) => {
  try {
    // model 裡的 .create() 的語法是 promise，所以這邊要用 async await
    const result = await products.create(req.body)
    res.status(200).json({ success: true, message: '', result })
  } catch (error) {
    console.log(error)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      const message = error.errors[key].message
      res.status(400).json({ success: false, message })
    } else {
      res.status(500).json({ success: false, message: '未知錯誤' })
    }
  }
}

// 單個查詢
export const getProduct = async (req, res) => {
  try {
    // req.params 是物件，需要用 req.params.id 才能把 id 的值抓出來
    const result = await products.findById(req.params.id)
    // console.log(req.params)
    if (result) {
      res.status(200).json({ success: true, message: '', result })
    } else {
      res.status(404).json({ success: false, message: '找不到商品' })
    }
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(400).json({ success: false, message: 'ID 格式錯誤' })
    }
  }
}

export const getProducts = async (req, res) => {
  try {
    /*
    const result = await products.find({
      // 要符合陣列裡的所有條件才會回傳那筆資料
      $and: [
        // 名字:有皮件
        { name: /皮件/i },
        // 價格:小魚等於 500
        { price: { $lte: 500 } }
      ]
    })
    */

    // gte 大於等於
    // 建立空陣列
    const query = { $and: [] }
    if (req.query.pricegte) {
      // 檢查是不是數字
      const gte = parseInt(req.query.pricegte)
      if (!isNaN(gte)) {
        // 如果是數字就將資料push進$and這個陣列裡
        query.$and.push({ price: { $gte: gte } })
      }
    }

    // lte 小於等於
    if (req.query.pricelte) {
      const lte = parseInt(req.query.pricelte)
      if (!isNaN(lte)) {
        query.$and.push({ price: { $lte: lte } })
      }
    }

    if (req.query.category) {
      query.$and.push({ category: { $eq: req.query.category } })
      // query.$and.push({ category: req.query.category })
    }

    if (req.query.keywords) {
      // split(' ') 用空白分割成陣列，並用 .filter 將多打的空白過濾掉
      const keywords = req.query.keywords.split(' ').filter(keyword => keyword.length > 0)
      // const keywords = req.query.keywords.split(' ').filter(keyword => {
      //   return keyword.length > 0})
      const names = []
      // 對關鍵字跑迴圈
      for (const keyword of keywords) {
        // new RegExp 每個轉成正則表達式，轉完放進 names 陣列裡面
        // 關鍵字若不用正則表達式則需要完全符合才找得到，這樣就做不到模糊搜尋
        // i 代表不分大小寫
        names.push(new RegExp(keyword, 'i'))
      }
      // $in 包含， $nin 不包含，搜尋的名字 name 要包含正則表達式 names 陣列裡面的結果
      query.$and.push({ name: { $in: names } })
    }

    console.log(JSON.stringify(query, true, null))
    // $and 不能是空陣列，所以加判斷，如果沒有資料給它一個{} =沒有任何條件，讓它有東西
    // .sort({欄位名}) 1 是正序排列 -1是倒序
    const result = await products.find(query.$and.length > 0 ? query : {}).sort({ price: 1 })
    res.status(200).json({ success: true, message: '', result })
  } catch (error) {
    res.status(500).json({ success: false, message: '未知錯誤' })
  }
}
