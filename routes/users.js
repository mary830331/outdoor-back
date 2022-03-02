import express from 'express'
import content from '../middleware/content.js'
import auth from '../middleware/auth.js'
import admin from '../middleware/admin.js'
import upload from '../middleware/upload.js'

import {
  register,
  login,
  logout,
  extend,
  getUserInfo,
  addGroup,
  getGroup,
  updateGroup,
  updateUserInfo
} from '../controllers/users.js'

const router = express.Router()

router.post('/', content('application/json'), register)
router.post('/login', content('application/json'), login)
router.post('/extend', auth, extend)
router.delete('/logout', auth, logout)
router.get('/me/addgroup', auth, getGroup)
router.get('/me', auth, getUserInfo)
router.patch('/userinfo/:id', auth, admin, content('multipart/form-data'), upload, updateUserInfo)
router.post('/me/addgroup', auth, addGroup)
router.patch('/me/addgroup', auth, updateGroup)

export default router
