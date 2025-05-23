const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('../config/secret')

class LoginController {
  // 加密token
  async sign(ctx,next){
    // 1.获取用户的信息
    const {id,name} = ctx.user

    // 2.颁发令牌token -- 非对称加密
    const payload = {id,name}
    const token = jwt.sign(payload,PRIVATE_KEY,{
      expiresIn: '1d', // '1h' '1d', 或者 number秒数 
      algorithm: 'RS256'
    })

    // 3.返回信息给前端
    ctx.body = {
      code: 0,
      data:{
        id,
        name,
        token
      },
      message: '登录成功!'
    }
  }

  // 测试登录接口test
  async test(ctx,next){
    ctx.body = {
      code: 0,
      message: '登录成功!',
      info: ctx.user
    }
  }
}

module.exports = new LoginController()