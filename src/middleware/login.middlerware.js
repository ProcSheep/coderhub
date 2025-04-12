const {
  NAME_AND_PASSWORD_IS_REQUIERD,
  NAME_IS_NOT_EXISTS,
  PASSWORD_IS_INCORRENT,
  UNANTHORIZATION,
} = require("../config/error.js");
const { PUBLIC_KEY } = require("../config/secret.js");
const UserService = require("../service/user.service.js");
const md5password = require("../utils/md5Password.js");
const jwt = require('jsonwebtoken')

async function verifyLogin(ctx, next) {
  const { name, password } = ctx.request.body;
  // 1.用户名和密码是否为空
  if (!name || !password) {
    return ctx.app.emit("error", NAME_AND_PASSWORD_IS_REQUIERD, ctx);
  }
  // 2.查询数据库中是否存在这个用户,数据库操作记得异步操作
  const users = await UserService.findUserByName(name);
  /** 如果查到数据,结果返回一个数组,如下
   * "users": [
        {
            "id": 1,
            "name": "codewhy",
            "password": "123456",
            "createAt": "2025-04-09T12:37:40.000Z",
            "updateAt": "2025-04-09T12:37:40.000Z"
        }
      ]
  */
  const user = users[0];
  if (!user) {
    // 如果查不到数据,就是undefined
    return ctx.app.emit("error", NAME_IS_NOT_EXISTS, ctx);
  }
  // 3.检查用户信息与数据库是否一致
  // 到这一步说明,用户名已经正确了,我们获取的数据库用户信息user中,肯定有password的数据
  // 客户端传递过来的密码经过md5加密后与数据库存储的密码进行比对
  if (user.password !== md5password(password)) {
    return ctx.app.emit("error", PASSWORD_IS_INCORRENT, ctx);
  }

  // 4.将这个用户的信息保存进ctx里面,在下一个中间件使用
  ctx.user = user

  // 5.进入下一个中间件,颁发令牌
  await next()
}

// 验证Auth的中间件
async function  verifyAuth(ctx,next) {
    // 1.获取客户端auth
    const authorization = ctx.headers.authorization
    // console.log(authorization)
    if(!authorization) return ctx.app.emit('error',UNANTHORIZATION,ctx)
    const token = authorization.replace('Bearer ','')

    // 2.验证token中的信息
    try {
      const res = jwt.verify(token,PUBLIC_KEY,{
        algorithms: ['RS256']
      })
      // 3.把解析的信息存入ctx(下一个中间件使用)
      ctx.user = res
      // 4.传递给下一个中间件
      await next()
    } catch (error) {
      ctx.app.emit('error',UNANTHORIZATION,ctx)
    }
}

module.exports = { verifyLogin,verifyAuth };
