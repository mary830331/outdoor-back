import mongoose from 'mongoose'
import md5 from 'md5'
import validator from 'validator'

const userSchema = new mongoose.Schema({
  account: {
    type: String,
    minlength: [4, '帳號必須 4 個字以上'],
    maxlength: [20, '帳號必須 20 個字以下'],
    unique: true,
    required: [true, '帳號不能空白']
  },
  password: {
    type: String,
    minlength: [4, '密碼必須 4 個字以上'],
    maxlength: [20, '密碼必須 20 個字以下'],
    required: [true, '密碼不能空白']
  },
  email: {
    type: String,
    required: [true, '信箱不能空白'],
    unique: true,
    validate: {
      validator (email) {
        return validator.isEmail(email)
      },
      message: '信箱格式不正確'
    }
  },
  name: {
    type: String,
    required: [true, '暱稱不能空白']
  },
  image: {
    type: String
  },
  description: {
    type: String
  },
  age: {
    type: Number,
    required: [true, '年齡不能空白']
  },
  role: {
    // 0 = 一般會員
    // 1 = 管理員
    type: Number,
    default: 1
  },
  tokens: {
    type: [String]
  },
  news: {
    type: String
  },
  category01: {
    type: String,
    enum: {
      values: ['百岳', '中級山', '郊山', '探勘', '秘境', '露營', '野溪溫泉', '溯溪', '水肺潛水', '自由潛水', 'SUP', '衝浪', '其他'],
      message: '活動分類不存在'
    }
  },
  category02: {
    type: String,
    enum: {
      values: ['百岳', '中級山', '郊山', '探勘', '秘境', '露營', '野溪溫泉', '溯溪', '水肺潛水', '自由潛水', 'SUP', '衝浪', '其他'],
      message: '活動分類不存在'
    }
  },
  category03: {
    type: String,
    enum: {
      values: ['百岳', '中級山', '郊山', '探勘', '秘境', '露營', '野溪溫泉', '溯溪', '水肺潛水', '自由潛水', 'SUP', '衝浪', '其他'],
      message: '活動分類不存在'
    }
  },
  addgroup: {
    type: [
      {
        product: {
          type: mongoose.ObjectId,
          ref: 'products',
          required: [true, '缺少商品 ID']
        }
      }
    ]
  }
}, { versionKey: false })

userSchema.pre('save', function (next) {
  const user = this
  if (user.isModified('password')) {
    if (user.password.length >= 4 && user.password.length <= 20) {
      user.password = md5(user.password)
    } else {
      const error = new mongoose.Error.ValidationError(null)
      error.addError('password', new mongoose.Error.ValidatorError({ message: '密碼長度錯誤' }))
      next(error)
      return
    }
  }
  next()
})

userSchema.pre('findOneAndUpdate', function (next) {
  const user = this._update
  if (user.password) {
    if (user.password.length >= 4 && user.password.length <= 20) {
      user.password = md5(user.password)
    } else {
      const error = new mongoose.Error.ValidationError(null)
      error.addError('password', new mongoose.Error.ValidatorError({ message: '密碼長度錯誤' }))
      next(error)
      return
    }
  }
  next()
})

export default mongoose.model('users', userSchema)
