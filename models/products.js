import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '地點不能為空']
  },
  time: {
    type: String,
    required: [true, '時間不能為空']
  },
  price: {
    type: String,
    min: [0, '價格格式不正確'],
    required: [true, '商品價格不能為空']
  },
  description: {
    type: String
  },
  image: {
    type: String
  },
  sell: {
    type: Boolean,
    default: false
  },
  precautions: {
    type: String
  },
  authorId: {
    type: String
  },
  authorName: {
    type: String
  },
  authorAge: {
    type: String
  },
  authorNews: {
    type: String
  },
  authorImg: {
    type: String
  },
  category: {
    type: String,
    enum: {
      values: ['百岳', '中級山', '郊山', '探勘', '秘境', '露營', '野溪溫泉', '溯溪', '水肺潛水', '自由潛水', 'SUP', '衝浪', '其他'],
      message: '活動分類不存在'
    }
  }
}, { versionKey: false })

export default mongoose.model('products', productSchema)
