// 引入koa和它的第三方工具
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const registerRouters = require('../router/index.js')
// 引入路由
// const userRouter = require('../router/user.router.js')
// const loginRouter = require('../router/login.router.js')

// 1.创建app
const app = new Koa()

// 2.对app使用中间件
app.use(bodyParser())
// app.use(userRouter.routes())
// app.use(userRouter.allowedMethods())
// app.use(loginRouter.routes())
// app.use(loginRouter.allowedMethods())
registerRouters(app)

// 3.导出app
module.exports = app