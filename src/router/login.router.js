const KoaRouter = require('@koa/router')
// 验证用户中间件
const {verifyLogin, verifyAuth} = require('../middleware/login.middlerware')
// controller的中间件
const {sign,test} = require('../controller/login.controller')

const loginRouter = new KoaRouter({prefix:'/login'})
// 中间件: verifyLogin负责校验用户名和密码; sign负责加密token令牌
loginRouter.post('/',verifyLogin,sign)
// 测试登录携带token的功能
// 验证Auth的功能许多接口都会使用,所以封装进middleware中间件
loginRouter.get('/test',verifyAuth,test)

module.exports = loginRouter