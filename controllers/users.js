import md5 from 'md5'
import jwt from 'jsonwebtoken'
import users from '../models/users.js'
import products from '../models/products.js'

export const register = async (req, res) => {
  try {
    await users.create(req.body)
    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      res.status(400).send({ success: false, message: error.errors[key].message })
    } else if (error.name === 'MongoServerError' && error.code === 11000) {
      res.status(400).send({ success: false, message: '帳號已存在' })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const login = async (req, res) => {
  try {
    const user = await users.findOne(
      { account: req.body.account, password: md5(req.body.password) },
      '-password'
    )
    if (user) {
      const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET, { expiresIn: '7 days' })
      user.tokens.push(token)
      await user.save()
      const result = user.toObject()
      delete result.tokens
      result.token = token
      // result.addgroup = result.addgroup.length
      res.status(200).send({ success: true, message: '', result })
    } else {
      res.status(404).send({ success: false, message: '帳號或密碼錯誤' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token !== req.token)
    await req.user.save()
    res.status(200).send({ success: true, message: '' })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const extend = async (req, res) => {
  try {
    const idx = req.user.tokens.findIndex(token => token === req.token)
    const token = jwt.sign({ _id: req.user._id.toString() }, process.env.SECRET, { expiresIn: '7 days' })
    req.user.tokens[idx] = token
    req.user.markModified('tokens')
    await req.user.save()
    res.status(200).send({ success: true, message: '', result: { token } })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const getUserInfo = (req, res) => {
  try {
    const result = req.user.toObject()
    delete result.tokens
    // result.addgroup = result.addgroup.length
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}
// 修改個人資訊
export const updateUserInfo = async (req, res) => {
  const data = {
    name: req.body.name,
    description: req.body.description,
    age: req.body.age,
    category01: req.body.category01,
    category02: req.body.category02,
    category03: req.body.category03,
    news: req.body.news
  }
  if (req.file) {
    data.image = req.file.path
  }
  console.log(data)
  try {
    const result = await users.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
    res.status(200).send({ success: true, message: '', result })
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const addGroup = async (req, res) => {
  try {
    const idx = req.user.addgroup.findIndex(item => item.product.toString() === req.body.product)
    if (idx > -1) {
      req.user.addgroup[idx].quantity += req.body.quantity
    } else {
      const result = await products.findById(req.body.product)
      if (!result || !result.sell) {
        res.status(404).send({ success: false, message: '商品不存在' })
        return
      }
      req.user.addgroup.push(req.body)
    }
    await req.user.save()
    res.status(200).send({ success: true, message: '', result: req.user.addgroup.length })
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(404).send({ success: false, message: '找不到' })
    } else if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      res.status(400).send({ success: false, message: error.errors[key].message })
    } else {
      res.status(500).send({ success: false, message: '伺服器錯誤' })
    }
  }
}

export const getGroup = async (req, res) => {
  try {
    const { addgroup } = await users.findById(req.user._id, 'addgroup').populate('addgroup.product')
    res.status(200).send({ success: true, message: '', result: addgroup })
  } catch (error) {
    console.log(error)
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}

export const updateGroup = async (req, res) => {
  try {
    if (req.body.quantity === 0) {
      // await users.findByIdAndUpdate(req.user._id,
      //   {
      //     $pull: {
      //       addgroup: { product: req.body.product }
      //     }
      //   }
      // )
      const idx = req.user.addgroup.findIndex(item => item.product.toString() === req.body.product)
      if (idx > -1) {
        req.user.addgroup.splice(idx, 1)
      }
      await req.user.save()
      res.status(200).send({ success: true, message: '' })
    } else {
      // await users.findOneAndUpdate(
      //   { _id: req.user._id, 'addgroup.product': req.body.product },
      //   {
      //     $set: {
      //       'addgroup.$.quantity': req.body.quantity
      //     }
      //   }
      // )
      const idx = req.user.addgroup.findIndex(item => item.product.toString() === req.body.product)
      if (idx > -1) {
        req.user.addgroup[idx].quantity = req.body.quantity
      }
      await req.user.save()
      res.status(200).send({ success: true, message: '' })
    }
  } catch (error) {
    res.status(500).send({ success: false, message: '伺服器錯誤' })
  }
}
