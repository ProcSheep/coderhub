const KoaRouter = require('@koa/router')
const {verifyAuth} = require('../middleware/login.middlerware.js')
const hanldAvatar = require('../middleware/file.middleware.js')
const {create} = require('../controller/file.controller.js')
const fileRouter = new KoaRouter({prefix:'/file'})

// 上传头像接口
fileRouter.post('/avatar',verifyAuth,hanldAvatar,create)


module.exports = fileRouter