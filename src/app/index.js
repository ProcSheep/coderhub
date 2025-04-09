// 引入koa和它的第三方工具
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
// 引入路由
const userRouter = require('../router/user.router.js')

// 1.创建app
const app = new Koa()

// 2.对app使用中间件
app.use(bodyParser())
app.use(userRouter.routes())
app.use(userRouter.allowedMethods())

// 3.导出app
module.exports = app