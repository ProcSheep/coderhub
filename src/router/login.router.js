const KoaRouter = require('@koa/router')
// 验证用户中间件
const {verifyLogin} = require('../middleware/login.middlerware')
// 颁发令牌中间件
const {sign} = require('../controller/login.controller')

const loginRouter = new KoaRouter({prefix:'/login'})
// 中间件: verifyLogin负责校验用户名和密码; sign负责加密token令牌
loginRouter.post('/',verifyLogin,sign)

module.exports = loginRouter